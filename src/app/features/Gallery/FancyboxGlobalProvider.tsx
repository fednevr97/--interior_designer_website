'use client';
import { useEffect } from 'react';
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

export default function FancyboxGlobalProvider() {
  useEffect(() => {
    // Универсальный селектор для всех галерей
    const selector = '[data-fancybox^="gallery-"]';
    Fancybox.unbind(selector);
    Fancybox.bind(selector, {
      Hash: false,
      dragToClose: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      closeButton: "auto",
      Images: {
        zoom: !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        zoomOpacity: "auto",
      },
      Toolbar: {
        display: {
          left: ["infobar"],
          middle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            ? []
            : [
                "zoomIn",
                "zoomOut",
                "toggle1to1",
                "rotateCCW",
                "rotateCW",
                "flipX",
                "flipY",
              ],
          right: ["close"],
        },
      },
    });
    return () => {
      Fancybox.unbind(selector);
    };
  }, []);
  return null;
}