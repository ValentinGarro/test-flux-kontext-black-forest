export default function SectionButtons(
    {
        principal,
        revers,
        next,
        prev,
        color
    }: 
    {
        principal: ()=>void,
        revers: ()=>void | null,
        next: ()=>void,
        prev: ()=>void,
        color?: string
    }
) {  
    return (
        <section className="w-full flex items-center justify-evenly absolute bottom-16 px-30  left-0 z-100">
            <div className="relative w-full">
                {prev && 
                    <button 
                        onClick={()=>{prev(); }}
                        className={`absolute top-1/2 left-1/4 transform  -translate-y-1/2 text-7xl text-${color}  font-bold cursor-pointer hover:opacity-80`}>
                            {`<`}
                    </button>
                }
                {
                    principal && 
                        <button 
                            onClick={()=>{principal(); }} 
                            className={`absolute -top-1/2 left-1/2  transform -translate-x-1/2 -translate-y-1/2 h-24 w-24 border-4 border-${color} group  hover:border-${color}/80 p-1 hover:p-2 transition flex items-center justify-center rounded-full cursor-pointer`}
                            >
                            <span className={`block w-full h-full bg-${color} rounded-full group-hover:bg-${color}/80 transition`}></span>
                        </button>
                }
                {next && 
                    <button 
                        onClick={()=>{next(); }}
                        className={`absolute top-1/2 right-1/4 transform  -translate-y-1/2 text-7xl text-${color}  font-bold cursor-pointer hover:opacity-80`}>
                            {`>`}
                    </button>
                }
                {
                    revers && <button 
                    onClick={()=>{revers(); }}
                    className="absolute top-1/2 right-0 transform  -translate-y-1/2 text-7xl  font-bold cursor-pointer hover:opacity-80">⬅️</button>

                }
            </div>
        </section>
    );
}