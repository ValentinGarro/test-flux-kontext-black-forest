"use client"
import React, { useRef, useEffect, useState } from "react";
import { showToast } from "./SonnerSimple";

export default function Camera({
    videoRef,
    canvasRef
}: { 
    videoRef: React.RefObject<HTMLVideoElement>,
    canvasRef: React.RefObject<HTMLCanvasElement>
}) { 

  useEffect(() => {
    const getCamera = async () => { 
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        } 
    };
    getCamera(); 
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);
   
  return (
    <div className="w-full h-full"> 
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover "/> 
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};
 
