import React from "react";
import { FaTshirt, FaVest } from "react-icons/fa";
import {
  GiTShirt,
  GiAmpleDress,
  GiMonclerJacket,
  GiSonicShoes,
  GiSandal,
  GiBoots,
  GiUnderwearShorts,
  GiSkirt,
  GiHoodie,
  GiSuitcase,
  GiPirateCoat,
} from "react-icons/gi";
import {
  PiShirtFoldedThin,
  PiPants,
  PiPantsFill,
  PiHoodieDuotone,
  PiBeanieFill,
  PiSneakerMoveFill,
} from "react-icons/pi";
import { TbShirtSport } from "react-icons/tb";
import { LiaHatCowboySolid, LiaUserTieSolid } from "react-icons/lia";
import { IconType } from "react-icons";

const iconComponents: Record<string, IconType> = {
  GiTShirt,
  PiShirtFoldedThin,
  GiAmpleDress,
  PiPants,
  GiMonclerJacket,
  PiSneakerMoveFill,
  GiSonicShoes,
  GiSandal,
  GiBoots,
  GiUnderwearShorts,
  GiSkirt,
  PiPantsFill,
  PiHoodieDuotone,
  GiHoodie,
  FaVest,
  GiSuitcase,
  GiPirateCoat,
  TbShirtSport,
  PiBeanieFill,
  LiaHatCowboySolid,
  LiaUserTieSolid,
};

interface IconCategoryProps {
  icon: string;
}

export default function IconCategory({ icon }: IconCategoryProps) {
  const Icon = (iconComponents[icon] || FaTshirt) as React.ComponentType<any>;
  return <Icon className="w-[28vw] h-[35vw]" />;
}