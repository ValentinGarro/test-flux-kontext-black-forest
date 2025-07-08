export default function Loader({
  show,
  fullscreen = true, // por defecto cubre toda la pantalla
}: {
  show: boolean;
  fullscreen?: boolean;
}) {
  const positionClass = fullscreen
    ? "fixed inset-0"
    : "absolute inset-0 rounded-2xl";

  return (
    <div
      className={`${positionClass} z-[1000] bg-black/60 flex items-center justify-center pointer-events-auto transition duration-500`}
      style={{
        opacity: show ? 1 : 0,
        visibility: show ? "visible" : "hidden",
      }}
    >
      <span className="block w-24 h-24 border-10 border-gray-300 border-t-gray-500 rounded-full animate-spin"></span>
    </div>
  );
}