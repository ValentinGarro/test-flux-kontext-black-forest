import Image from "next/image";
import { clothe } from "../../../types/clothe";

export default function InputClothes({clothe,setValue, isActive}: {clothe:clothe,isActive:boolean,  setValue: (name: string, value: any, options?: any) => void, }) {
    const handleSelect = () => {
        setValue("clothe", clothe ,{ shouldValidate : true });
    }
    return (
        <Image
            src={clothe.img}
            alt="Clothes"
            width={200}
            height={200}
            className={`rounded-2xl h-[20vh] w-auto relative  ${isActive ? "border-gray-400" : "hover:border-gray-400"} cursor-pointer  border-1  transition`}
            onClick={handleSelect} 
        />
    );
}