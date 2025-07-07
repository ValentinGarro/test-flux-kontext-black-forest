export default function Loader(
   {show}: {show: boolean}
) {
  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center pointer-events-auto transition duration-500"
        style={{
            opacity: show ? 1 : 0,
            visibility: show ? "visible" : "hidden",
        }}
    >
      <span className="block w-24 h-24 border-10 border-gray-300 border-t-gray-500 rounded-full animate-spin"></span>
    </div>
  );
}