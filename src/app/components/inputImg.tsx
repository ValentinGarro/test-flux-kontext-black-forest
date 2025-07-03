import Image from "next/image";

export default function InputImg({title,des,name,image, setValue, setImage, register}: 
    {
        title: string,
        des:string,
        name: string, 
        image: File | null, 
        setValue: (name: string, value: any, options?: any) => void, 
        setImage: (image: File | null) => void, register: any}) {
    const handleSetImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setValue(name, file, { shouldValidate: true });
        }
    };
    const handleRemoveImage = () => {
        setImage(null);
        setValue(name, null, { shouldValidate: true });
    };
    return (
        <section className="flex items-center flex-col  justify-center gap-5 h-full w-full">
        <h2 className="text-5xl ">{title}</h2>
    { !image ? 
        (<>
            <label htmlFor={name} className="text-3xl cursor-pointer">{des}</label>
            <label
                    htmlFor={name}
                    className="flex items-center justify-center  w-full h-[60vh] border-2 border-dashed border-gray-400 rounded-2xl cursor-pointer hover:bg-gray-100 transition"
                >
                <span className="text-6xl text-gray-400">+</span>
            </label>
            <input
                {...register(name)}
                id={name}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleSetImage}
            />
        </>
        ):(
            <div className="relative">
                <Image 
                    src={URL.createObjectURL(image)}
                    alt="Image"
                    width={200}
                    height={200}
                    className="rounded-2xl h-[60vh] w-auto relative bg-amber-50/70 p-1"
                />
                <button 
                    type="button" 
                    className="absolute text-xs top-0 right-0 bg-red-500 text-white px-2 py-1 rounded-2xl cursor-pointer hover:bg-red-600 transition"
                    onClick={handleRemoveImage}
                >X</button>
            </div>
        )
    }
         
    </section>
    );
};