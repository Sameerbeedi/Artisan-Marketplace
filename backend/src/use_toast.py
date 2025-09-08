import time
import threading
from typing import Callable, Dict, List, Optional

# Config
TOAST_LIMIT = 1
TOAST_REMOVE_DELAY = 1000000  # ms

# Types
class ToasterToast:
    def __init__(self, id: str, title: str = None, description: str = None, action: Callable = None, open: bool = True):
        self.id = id
        self.title = title
        self.description = description
        self.action = action
        self.open = open

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "open": self.open,
        }


# State
memory_state = {"toasts": []}
listeners: List[Callable] = []
toast_timeouts: Dict[str, threading.Timer] = {}

count = 0


def gen_id() -> str:
    global count
    count = (count + 1) % (2**53)  # like JS Number.MAX_SAFE_INTEGER
    return str(count)


# Reducer actions
def reducer(state, action):
    t_type = action["type"]

    if t_type == "ADD_TOAST":
        new_toasts = [action["toast"]] + state["toasts"]
        state["toasts"] = new_toasts[:TOAST_LIMIT]
        return state

    if t_type == "UPDATE_TOAST":
        updated = []
        for t in state["toasts"]:
            if t.id == action["toast"]["id"]:
                for k, v in action["toast"].items():
                    setattr(t, k, v)
            updated.append(t)
        state["toasts"] = updated
        return state

    if t_type == "DISMISS_TOAST":
        toast_id = action.get("toastId")
        if toast_id:
            add_to_remove_queue(toast_id)
        else:
            for t in state["toasts"]:
                add_to_remove_queue(t.id)
        for t in state["toasts"]:
            if t.id == toast_id or toast_id is None:
                t.open = False
        return state

    if t_type == "REMOVE_TOAST":
        toast_id = action.get("toastId")
        if toast_id is None:
            state["toasts"] = []
        else:
            state["toasts"] = [t for t in state["toasts"] if t.id != toast_id]
        return state

    return state


# Dispatch
def dispatch(action):
    global memory_state
    memory_state = reducer(memory_state, action)
    for listener in listeners:
        listener(memory_state)


# Auto-remove helper
def add_to_remove_queue(toast_id: str):
    if toast_id in toast_timeouts:
        return

    def remove():
        toast_timeouts.pop(toast_id, None)
        dispatch({"type": "REMOVE_TOAST", "toastId": toast_id})

    timer = threading.Timer(TOAST_REMOVE_DELAY / 1000, remove)
    toast_timeouts[toast_id] = timer
    timer.start()


# API functions
def toast(title: str = None, description: str = None, action: Callable = None):
    toast_id = gen_id()
    t = ToasterToast(id=toast_id, title=title, description=description, action=action)

    def update(new_data: dict):
        dispatch({
            "type": "UPDATE_TOAST",
            "toast": {"id": toast_id, **new_data}
        })

    def dismiss():
        dispatch({"type": "DISMISS_TOAST", "toastId": toast_id})

    dispatch({"type": "ADD_TOAST", "toast": t})

    return {"id": toast_id, "update": update, "dismiss": dismiss}


def use_toast(listener: Callable):
    """
    Register a listener to react to state changes.
    The listener will receive the current state dict.
    """
    listeners.append(listener)
    listener(memory_state)  # send initial state

    def unsubscribe():
        if listener in listeners:
            listeners.remove(listener)

    return {"toast": toast, "dismiss": lambda tid=None: dispatch({"type": "DISMISS_TOAST", "toastId": tid}), "unsubscribe": unsubscribe}
