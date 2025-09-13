"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast"

export function Toaster() {
  const { messages } = useToast()   // ✅ get messages (array) from hook

  return (
    <ToastProvider>
      {messages.map((msg, index) => (
        <Toast key={index}>
          <div className="grid gap-1">
            <ToastTitle>Notification</ToastTitle>
            <ToastDescription>{msg}</ToastDescription>
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
