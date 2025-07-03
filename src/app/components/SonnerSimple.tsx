import { Toaster, toast } from "sonner";

export function SonnerSimple() {
  return <Toaster position="top-right" richColors />;
}

// Utiliza esta función para mostrar una notificación simple desde cualquier parte:
export function showToast(msg: string) {
  toast(msg);
}
