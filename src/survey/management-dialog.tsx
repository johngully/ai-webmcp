import { useEffect, useRef, type ReactNode } from 'react'

export function ManagementDialog({
  title,
  onDismiss,
  busy = false,
  children,
}: {
  title: string
  onDismiss: () => void
  busy?: boolean
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const opener = document.activeElement as HTMLElement
    const dialog = ref.current!
    dialog.showModal()
    return () => {
      dialog.close()
      if (opener.isConnected && !opener.matches(':disabled')) opener.focus()
      else document.getElementById('management-heading')?.focus()
    }
  }, [])
  return (
    <dialog
      ref={ref}
      aria-labelledby="dialog-heading"
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onDismiss()
      }}
    >
      <h2 id="dialog-heading">{title}</h2>
      {children}
    </dialog>
  )
}
