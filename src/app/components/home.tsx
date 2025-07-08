"use client";
import { useEffect, useRef, useState } from "react"; 
import axios from "axios"; 
import Camera from "./camera";
import { showToast, SonnerSimple } from "./SonnerSimple";
import SectionButtons from "./sectionButtons";
import Loader from "./loader";  
import { Category } from "../types/category";
import Modal from "./modal";
import Carucel from "./carucel";
import { clothe } from "../types/clothe"; 
import { base64ToBlob } from "../helpers/fun";
import { CreateImg } from "../types/createImg";

export default function Home() {
    const [imgResult, setImgResult] = useState<string | null>(null);
    const [data, setData] = useState<CreateImg>({model:null,clothe:null}); 
    /*Loader */
    const [loader, setLoader] = useState<boolean>(false);

    /*Paso en el formulario*/
    const [step, setStep] = useState(0);

    /*Ref para la camara */
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null); 

    /*Notificaciones */
    const [notification, setNotification] = useState<string | null>(null);
    useEffect(()=>{
        if(notification){
            showToast(notification);
            setNotification(null);
        }
    },[notification]); 
    
    /*Carrucel categorias */
    const [ccActive, setCcActive] = useState<number>(0);
    const [cpActive, setCpActive] = useState<number>(0);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categorySelect, setCategorySelect] = useState<Category | null>(null);
    const [products, setProducts] = useState<clothe[]>([]); 
    useEffect(() => {
        const fetchCategories = async () => {
            const response = await axios.get("/api/categories"); 
            setCategories(response.data);
        };
        fetchCategories();
    }, []); 
    /*Funciones de la botonera */
    const [functionPrincipal, setFunctionPrincipal] = useState<()=>void>(null);
    const [functionRevers, setFunctionRevers] = useState<()=>void | null>(null);
    const [functionNext, setFunctionNext] = useState<()=>void | null>(null);
    const [functionPrev, setFunctionPrev] = useState<()=>void | null>(null);
    /*Funcion de orden sperior*/
    const higthFun = (fun:()=>void) => {
        return ()=>{
            setLoader(true);
            fun();
            setTimeout(()=>{
                setLoader(false)
            },1000)
        }
    }
    /*Funciones principales por step */
    const funPStep0 = higthFun(() => {  
        if(data.model){ //si existe la foto , la funcion es limpiar el modal
            setShowModal(false); 
            setImgModal(null);
            setStep(1); 
        }else{ //si no existe la foto , la funcion es tomar la foto 
            
            if (videoRef.current && canvasRef.current) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const image = canvas.toDataURL("image/png");
                    setData({...data, model:image }); 
                    showToast("Foto tomada");  
                    setFunctionRevers(() => funRStep0);
                }
            }

        } 
    }); 
    const funPStep1 = async (idx:number) => {  
        setLoader(true);
        setShowModal(false); 
        setImgModal(null); 
        const selectedCategory = categories[idx]; 
        setCategorySelect(selectedCategory);
    
        // Hacé el fetch directamente con el id de la categoría seleccionada
        const response = await axios.get(`/api/products/${selectedCategory.id}`);
        setProducts(response.data);
    
        setLoader(false);
        setCpActive(0);
        setStep(2);  
    };
    const funPStep2 =  async () => {   
        setLoader(true);
        setShowModal(false); 
        try	{ 
            const formData = new FormData();
            const base64 = data.model;
            const blob = base64ToBlob(base64);
            formData.append("imagen", blob, "foto.png");
            formData.append("prompt", data.clothe.prompt);

            const response = await axios.post("/api/espejo-magico", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
            }); 
            const { imagen_generada } = response.data;
            setImgResult(imagen_generada);  
            setStep(3);
            
        }catch(err){  
            setNotification(err.response.data.error as string); 
        }finally{
            setTimeout(()=>setLoader(false),2500)
        }
        
    };
    /*Funciones revers por step */
    const funRStep0 = higthFun(() =>{
        setShowModal(false); 
        setData({...data,model:null})
        setFunctionRevers(null);
    }); 
    const funRStep1 = higthFun(() =>{
        setShowModal(true);
        setImgModal(data.model as string);
        setStep(0);
        setCcActive(0);
    });
    const funRStep2 = higthFun(() => { 
        if(data.clothe){
            setShowModal(false); 
            setTimeout(()=>{
                setTitleModal(null); 
                setImgModal(data.model as string); 
            },600)
            setData({...data,clothe:null});
        }else{
            
            setProducts(null);
            setStep(1);
            setCpActive(0);
        }
    });
    const funRStep3 = higthFun(() => { 
        setStep(2);
        setImgResult(null);
        setImgModal(data.clothe.img);
        setTitleModal(data.clothe.name);
        setShowModal(true);
    });
    useEffect(()=>{  
        switch(step){
            case 0:
                setFunctionPrincipal(() => funPStep0);
                if(data.model) setFunctionRevers(() => funRStep0);
                setFunctionNext(null);
                setFunctionPrev(null);
                break;
            case 1:
                setFunctionPrincipal(() => ()=> funPStep1(ccActive));
                setFunctionRevers(() => funRStep1); 
               
                setFunctionNext(() => () => setCcActive(prev => (prev + 1) % categories.length));
                setFunctionPrev(() => () => setCcActive(prev => (prev - 1 + categories.length) % categories.length));
                break; 
            case 2:  
                if(!data.clothe){   
                    setFunctionPrincipal(()=> ()=> setData({...data,clothe:products[cpActive]}))
                }else{
                    setFunctionPrincipal(() => funPStep2  );  
                } 
                setFunctionNext(() => () => setCpActive(prev => (prev + 1) % products.length));
                setFunctionPrev(() => () => setCpActive(prev => (prev - 1 + products.length) % products.length));
                setFunctionRevers(() => funRStep2);   
                break; 
            case 3:
                setFunctionNext(null);
                setFunctionPrev(null);
                setFunctionPrincipal(() => null);  
                setFunctionRevers(() => funRStep3);  
                break; 
            
        }
    },[step, categorySelect,ccActive,cpActive,data])
    
    /*Render dependiendo del paso */
    const render = () => {
        switch(step){
            case 0:
                return(
                   <Camera videoRef={videoRef} canvasRef={canvasRef}/> 
                )
            case 1:
                return <Carucel  title="Categorias" active={ccActive} products={categories} />
            case 2 :
                return <Carucel  title="Prendas" active={cpActive} products={products} />
            case 3:
                return <div className="m-auto w-[100vw] h-full flex items-center justify-center "> 
                        <img 
                            src={imgResult}
                            alt="img result"
                            width={2000}
                            height={2000}
                            className="w-full h-full object-fill"
                        />
                </div>
        }
    } 
    /*Modal */
    const [showModal, setShowModal] = useState<boolean>(false); 
    const [imgModal, setImgModal] = useState<string | null>(null);
    const [titleModal, setTitleModal] = useState<string | null>(null);
    useEffect(()=>{   
    
        if (step === 0 &&typeof data.model === "string" && data.model.startsWith("data:image")) {
            setImgModal(data.model); 
            setShowModal(true); 
        } else if (step === 2 &&data.clothe && data.clothe.img) { 
            setShowModal(true);
            setImgModal(data.clothe.img);
            setTitleModal(data.clothe.name); 
        } 
    }, [data]);
    /*Cuando se abra el modal los botones del carrucel son null */
    useEffect(() => {
        if (showModal) {
          setFunctionNext(null);
          setFunctionPrev(null);
        } else {
          // Restaura el comportamiento normal según el paso
          switch(step){
            case 1:
              setFunctionNext(() => () => setCcActive(prev => (prev + 1) % categories.length));
              setFunctionPrev(() => () => setCcActive(prev => (prev - 1 + categories.length) % categories.length));
              break;
            case 2:
              setFunctionNext(() => () => setCpActive(prev => (prev + 1) % products.length));
              setFunctionPrev(() => () => setCpActive(prev => (prev - 1 + products.length) % products.length));
              break;
            default:
              setFunctionNext(null);
              setFunctionPrev(null);
          }
        }
      }, [showModal, step, categories, products]);
    return (
        <main className="h-[100vh] w-full overflow-hidden relative bg-amber-50">
            <SonnerSimple /> 
            <Loader show={loader}/> 
            { render()}
            <SectionButtons principal={functionPrincipal} revers={functionRevers} next={functionNext} prev={functionPrev}/>   
            <Modal show={showModal} img={imgModal} title={titleModal} />    
             
        </main>
    );
}