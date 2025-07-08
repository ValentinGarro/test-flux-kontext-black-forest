/*Funcion de orden sperior*/
export default function higthFun (setLoader:(b:boolean)=>void,fun: ()=>void|Promise<void>,delay=1000 ) {
    return async ()=>{
        setLoader(true);
        await fun();
        setTimeout(()=>{
            setLoader(false)
        },delay)
    }
}