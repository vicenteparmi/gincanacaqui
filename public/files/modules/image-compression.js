(function (global) {
  "use strict";

  const DEFAULT_OPTIONS = {
    maxDimension: 1600,
    maxBytes: 700 * 1024,
    initialQuality: 0.68,
    minQuality: 0.48,
    minDimension: 640,
  };
  const HEIC_CONVERTER_URL =
    "https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js";
  const HEIC_CONVERTER_INTEGRITY =
    "sha384-OTofQ0MEeiSgh62havBcemCIK0gqj809wX6UA0uPISNMRnR6NZyCdGzX3SbLrgwL";
  let heicConverterPromise;

  function fileExtension(file) {
    const match = (file.name || "").toLowerCase().match(/\.([a-z0-9]+)$/);
    return match ? match[1] : "";
  }

  function isHeicFile(file) {
    const extension = fileExtension(file);
    return (
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      extension === "heic" ||
      extension === "heif"
    );
  }

  function isAcceptedImage(file) {
    const acceptedExtensions = [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "avif",
      "gif",
      "bmp",
      "tif",
      "tiff",
      "heic",
      "heif",
    ];

    return (
      Boolean(file && file.type && file.type.indexOf("image/") === 0) ||
      acceptedExtensions.indexOf(fileExtension(file || {})) !== -1
    );
  }

  function loadHeicConverter() {
    if (typeof global.heic2any === "function") {
      return Promise.resolve(global.heic2any);
    }

    if (!heicConverterPromise) {
      heicConverterPromise = new Promise(function (resolve, reject) {
        const script = document.createElement("script");
        script.src = HEIC_CONVERTER_URL;
        script.integrity = HEIC_CONVERTER_INTEGRITY;
        script.crossOrigin = "anonymous";
        script.async = true;
        script.onload = function () {
          if (typeof global.heic2any === "function") {
            resolve(global.heic2any);
          } else {
            reject(new Error("O conversor HEIC não pôde ser iniciado."));
          }
        };
        script.onerror = function () {
          reject(
            new Error(
              "Não foi possível carregar o suporte a HEIC. Verifique sua conexão."
            )
          );
        };
        document.head.appendChild(script);
      });
    }

    return heicConverterPromise;
  }

  function loadImageSource(file) {
    return new Promise(function (resolve, reject) {
      const objectURL = URL.createObjectURL(file);
      const image = new Image();

      image.onload = function () {
        URL.revokeObjectURL(objectURL);
        resolve(image);
      };
      image.onerror = function () {
        URL.revokeObjectURL(objectURL);
        reject(new Error("Formato não reconhecido pelo navegador."));
      };
      image.src = objectURL;
    });
  }

  async function loadImage(file) {
    try {
      return await loadImageSource(file);
    } catch (nativeError) {
      if (!isHeicFile(file)) {
        throw new Error("Não foi possível ler a imagem selecionada.");
      }

      const convertHeic = await loadHeicConverter();
      const converted = await convertHeic({
        blob: file,
        toType: "image/jpeg",
        quality: 0.8,
      });
      const jpegBlob = Array.isArray(converted) ? converted[0] : converted;
      return loadImageSource(jpegBlob);
    }
  }

  function canvasToBlob(canvas, quality) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(
        function (blob) {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Não foi possível comprimir a imagem."));
          }
        },
        "image/jpeg",
        quality
      );
    });
  }

  function fileToDataURL(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = function () {
        reject(new Error("Não foi possível preparar a prévia da imagem."));
      };
      reader.readAsDataURL(file);
    });
  }

  async function compressImageFile(file, customOptions) {
    if (!isAcceptedImage(file)) {
      throw new Error("Selecione um arquivo de imagem válido.");
    }

    const options = Object.assign({}, DEFAULT_OPTIONS, customOptions || {});
    const source = await loadImage(file);
    const sourceWidth = source.naturalWidth || source.width;
    const sourceHeight = source.naturalHeight || source.height;

    if (!sourceWidth || !sourceHeight) {
      throw new Error("A imagem selecionada não possui dimensões válidas.");
    }

    const initialScale = Math.min(
      1,
      options.maxDimension / Math.max(sourceWidth, sourceHeight)
    );
    let width = Math.max(1, Math.round(sourceWidth * initialScale));
    let height = Math.max(1, Math.round(sourceHeight * initialScale));
    let quality = options.initialQuality;
    let blob;

    for (let attempt = 0; attempt < 12; attempt++) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d", { alpha: false });
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(source, 0, 0, width, height);

      blob = await canvasToBlob(canvas, quality);
      canvas.width = 1;
      canvas.height = 1;

      if (blob.size <= options.maxBytes) {
        break;
      }

      if (quality > options.minQuality) {
        quality = Math.max(options.minQuality, quality - 0.08);
      } else if (Math.max(width, height) > options.minDimension) {
        const resizeFactor = Math.max(
          0.72,
          Math.min(0.9, Math.sqrt(options.maxBytes / blob.size) * 0.95)
        );
        width = Math.max(1, Math.round(width * resizeFactor));
        height = Math.max(1, Math.round(height * resizeFactor));
      } else {
        break;
      }
    }

    const baseName = (file.name || "imagem").replace(/\.[^/.]+$/, "");
    const outputFile = new File([blob], baseName + ".jpg", {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    return {
      file: outputFile,
      previewURL: await fileToDataURL(outputFile),
      originalSize: file.size,
      compressedSize: outputFile.size,
      width: width,
      height: height,
    };
  }

  global.compressImageFile = compressImageFile;
})(window);
