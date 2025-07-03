import Image from "next/image";

export default function Modal({
    show, 
    img,
    title, 
}: {
    show: boolean, 
    img: string | null,
    title: string | null,
}){
    return(
        <article className="fixed inset-0 z-99 bg-black/60 flex items-center justify-center pointer-events-auto transition duration-500"
        style={{
            opacity: show ? 1 : 0,
            visibility: show ? "visible" : "hidden",
        }}
        >
            {
                img &&
                <div className=" h-[70vh] flex flex-col items-center justify-center rounded-2xl gap-5 bg-amber-50/70 p-2">
                    {title && <h2 className="text-5xl text-white font-bold">{title}</h2>}
                    <Image
                        src={img}
                        alt="Modal"
                        width={200}
                        height={200}
                        className="h-full w-auto relative object-cover"
                    />
                </div> 
            }
        </article>
    )
}