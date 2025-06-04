'use client';
import { useEffect } from 'react';
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

export default function FancyboxGlobalProvider() {
  useEffect(() => {
    const selector = '[data-fancybox^="gallery-"]';

    // Патчим setHash для полной безопасности
    // @ts-expect-error: patching third-party library
    Fancybox.setHash = () => {};

    // Очищаем глобальные обработчики истории
    function cleanUpFancyboxGlobals() {
      window.onpopstate = null;
      window.onhashchange = null;
    }

    Fancybox.unbind(selector);
    Fancybox.bind(selector, {
      Hash: false,
      placeFocusBack: false,
      Thumbs: false,
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

    cleanUpFancyboxGlobals();

    return () => {
      Fancybox.unbind(selector);
      cleanUpFancyboxGlobals();
    };
  }, []);
  return null;
}