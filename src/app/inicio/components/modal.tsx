import Image from "next/image";

export default function Modal({
    show, 
    img, 
}: {
    show: boolean, 
    img: string | null, 
}){
    return(
        <article className="fixed inset-0 z-99 bg-black/60 flex items-center justify-center pointer-events-auto  "
        style={{
            opacity: show ? 1 : 0,
            visibility: show ? "visible" : "hidden",
        }}
        >
            <div className=" h-[70vh] flex flex-col items-center justify-center rounded-2xl gap-5 bg-amber-50/70 p-2"> 
                {img && <Image
                    src={img}
                    alt="Modal"
                    width={200}
                    height={200}
                    className="h-full w-auto relative object-cover"
                />}
            </div> 
        </article>
    )
}