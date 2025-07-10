import { useEffect, useState } from "react"; 
import Image from "next/image";
import { Category } from "../../types/category";
import { clothe } from "../../types/clothe";

export default function Carucel ({
  active = 0,
  title,
  products
}: { active?: number, title: string, products: Category[] | clothe[] }) {
  const [props, setProps] = useState<Category[] | clothe[]>(products); 
  useEffect(() => {
    setProps(products);
  }, [products]);

  const pageSize = 6;
  const currentPage = Math.floor((active ?? 0) / pageSize);
  const start = currentPage * pageSize; 
  const activeInPage = (active ?? 0) - start;

  // Estado para animar transición
  const [page, setPage] = useState(currentPage);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (currentPage !== page) {
      setFade(false); // fade out
      const timeout = setTimeout(() => {
        setPage(currentPage);
        setFade(true); // fade in
      }, 180); // duración del fade out
      return () => clearTimeout(timeout);
    }
  }, [currentPage, page]);

  return (
    <section className=" w-full  flex flex-col items-center justify-center rounded-2xl p-5">
      <h1 className="text-center text-7xl text-gray-800 font-bold mb-8">{title}</h1>
      <div
        className={`
          grid grid-cols-3 min-grid-rows-2 gap-4 mx-auto -gap-y-5
          transition-all duration-300
          ${fade ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}
        `}
        style={{ minHeight: "10rem" }} // para evitar salto de layout
      >
        {props.slice(page * pageSize, (page + 1) * pageSize).map((c, idx) => (
          <div
            key={`c-${c.id}-${c.name}-${idx}`}
            className={`flex flex-col items-center justify-center h-32 w-32 rounded-2xl bg-amber-50 text-gray-900 text-2xl font-bold shadow-lg
              ${idx === activeInPage && page === currentPage ? "ring-4 ring-amber-400 scale-105 z-10" : ""}
              transition-all duration-200
            `}
          >
            {(c as clothe).img ? (
              <Image
                src={(c as clothe).img}
                alt={c.name}
                width={1000}
                height={1000}
                className="w-full h-full object-fill rounded-2xl"
              />
            ) : (
              <span>{c.name}</span>
            )} 
          </div>
        ))}
      </div>
    </section>
  );
}