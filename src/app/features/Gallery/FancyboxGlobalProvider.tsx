'use client';

import { useEffect } from 'react';
import "@fancyapps/ui/dist/fancybox/fancybox.css";

export default function FancyboxGlobalProvider() {
  useEffect(() => {
    const selector = '[data-fancybox^="gallery-"]';

    let isActive = true;

    import("@fancyapps/ui").then(({ Fancybox }) => {
      if (!isActive) return;

      // @ts-expect-error: patching setHash to noop to prevent hash updates in SPA
      Fancybox.setHash = () => {};

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
    });

    // Очистка при размонтировании
    return () => {
      isActive = false;
      import("@fancyapps/ui").then(({ Fancybox }) => {
        Fancybox.unbind(selector);
      });
    };
  }, []);

  return null;
}