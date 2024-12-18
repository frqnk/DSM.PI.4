// Returns whether the `js-string` built-in is supported.
function detectJsStringBuiltins() {
  let bytes = [
    0,   97,  115, 109, 1,   0,   0,  0,   1,   4,   1,   96,  0,
    0,   2,   23,  1,   14,  119, 97, 115, 109, 58,  106, 115, 45,
    115, 116, 114, 105, 110, 103, 4,  99,  97,  115, 116, 0,   0
  ];
  return WebAssembly.validate(
    new Uint8Array(bytes), {builtins: ['js-string']});
}

// Compiles a dart2wasm-generated main module from `source` which can then
// instantiatable via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = detectJsStringBuiltins()
      ? {builtins: ['js-string']} : {};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm modules from `bytes` which is then
// instantiatable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = detectJsStringBuiltins()
      ? {builtins: ['js-string']} : {};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

// DEPRECATED: Please use `compile` or `compileStreaming` to get a compiled app,
// use `instantiate` method to get an instantiated app and then call
// `invokeMain` to invoke the main function.
export async function instantiate(modulePromise, importObjectPromise) {
  var moduleOrCompiledApp = await modulePromise;
  if (!(moduleOrCompiledApp instanceof CompiledApp)) {
    moduleOrCompiledApp = new CompiledApp(moduleOrCompiledApp);
  }
  const instantiatedApp = await moduleOrCompiledApp.instantiate(await importObjectPromise);
  return instantiatedApp.instantiatedModule;
}

// DEPRECATED: Please use `compile` or `compileStreaming` to get a compiled app,
// use `instantiate` method to get an instantiated app and then call
// `invokeMain` to invoke the main function.
export const invoke = (moduleInstance, ...args) => {
  moduleInstance.exports.$invokeMain(args);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredWasm` is a JS function that takes a module name matching a
  //   wasm file produced by the dart2wasm compiler and returns the bytes to
  //   load the module. These bytes can be in either a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  async instantiate(additionalImports, {loadDeferredWasm} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + js;
    }

    // Converts a Dart List to a JS array. Any Dart objects will be converted, but
    // this will be cheap for JSValues.
    function arrayFromDartList(constructor, list) {
      const exports = dartInstance.exports;
      const read = exports.$listRead;
      const length = exports.$listLength(list);
      const array = new constructor(length);
      for (let i = 0; i < length; i++) {
        array[i] = read(list, i);
      }
      return array;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {

      _1: (x0,x1,x2) => x0.set(x1,x2),
      _2: (x0,x1,x2) => x0.set(x1,x2),
      _6: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._6(f,arguments.length,x0) }),
      _7: x0 => new window.FinalizationRegistry(x0),
      _8: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      _9: (x0,x1) => x0.unregister(x1),
      _10: (x0,x1,x2) => x0.slice(x1,x2),
      _11: (x0,x1) => x0.decode(x1),
      _12: (x0,x1) => x0.segment(x1),
      _13: () => new TextDecoder(),
      _14: x0 => x0.buffer,
      _15: x0 => x0.wasmMemory,
      _16: () => globalThis.window._flutter_skwasmInstance,
      _17: x0 => x0.rasterStartMilliseconds,
      _18: x0 => x0.rasterEndMilliseconds,
      _19: x0 => x0.imageBitmaps,
      _192: x0 => x0.select(),
      _193: (x0,x1) => x0.append(x1),
      _194: x0 => x0.remove(),
      _197: x0 => x0.unlock(),
      _202: x0 => x0.getReader(),
      _211: x0 => new MutationObserver(x0),
      _222: (x0,x1,x2) => x0.addEventListener(x1,x2),
      _223: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      _226: x0 => new ResizeObserver(x0),
      _229: (x0,x1) => new Intl.Segmenter(x0,x1),
      _230: x0 => x0.next(),
      _231: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      _308: x0 => x0.close(),
      _309: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      _310: x0 => new window.ImageDecoder(x0),
      _311: x0 => x0.close(),
      _312: x0 => ({frameIndex: x0}),
      _313: (x0,x1) => x0.decode(x1),
      _316: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._316(f,arguments.length,x0) }),
      _317: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._317(f,arguments.length,x0) }),
      _318: (x0,x1) => ({addView: x0,removeView: x1}),
      _319: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._319(f,arguments.length,x0) }),
      _320: f => finalizeWrapper(f, function() { return dartInstance.exports._320(f,arguments.length) }),
      _321: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      _322: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._322(f,arguments.length,x0) }),
      _323: x0 => ({runApp: x0}),
      _324: x0 => new Uint8Array(x0),
      _326: x0 => x0.preventDefault(),
      _327: x0 => x0.stopPropagation(),
      _328: (x0,x1) => x0.addListener(x1),
      _329: (x0,x1) => x0.removeListener(x1),
      _330: (x0,x1) => x0.prepend(x1),
      _331: x0 => x0.remove(),
      _332: x0 => x0.disconnect(),
      _333: (x0,x1) => x0.addListener(x1),
      _334: (x0,x1) => x0.removeListener(x1),
      _336: (x0,x1) => x0.append(x1),
      _337: x0 => x0.remove(),
      _338: x0 => x0.stopPropagation(),
      _342: x0 => x0.preventDefault(),
      _343: (x0,x1) => x0.append(x1),
      _344: x0 => x0.remove(),
      _345: x0 => x0.preventDefault(),
      _350: (x0,x1) => x0.removeChild(x1),
      _351: (x0,x1) => x0.appendChild(x1),
      _352: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _353: (x0,x1) => x0.appendChild(x1),
      _354: (x0,x1) => x0.transferFromImageBitmap(x1),
      _356: (x0,x1) => x0.append(x1),
      _357: (x0,x1) => x0.append(x1),
      _358: (x0,x1) => x0.append(x1),
      _359: x0 => x0.remove(),
      _360: x0 => x0.remove(),
      _361: x0 => x0.remove(),
      _362: (x0,x1) => x0.appendChild(x1),
      _363: (x0,x1) => x0.appendChild(x1),
      _364: x0 => x0.remove(),
      _365: (x0,x1) => x0.append(x1),
      _366: (x0,x1) => x0.append(x1),
      _367: x0 => x0.remove(),
      _368: (x0,x1) => x0.append(x1),
      _369: (x0,x1) => x0.append(x1),
      _370: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _371: (x0,x1) => x0.append(x1),
      _372: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _373: x0 => x0.remove(),
      _374: x0 => x0.remove(),
      _375: (x0,x1) => x0.append(x1),
      _376: x0 => x0.remove(),
      _377: (x0,x1) => x0.append(x1),
      _378: x0 => x0.remove(),
      _379: x0 => x0.remove(),
      _380: x0 => x0.getBoundingClientRect(),
      _381: x0 => x0.remove(),
      _394: (x0,x1) => x0.append(x1),
      _395: x0 => x0.remove(),
      _396: (x0,x1) => x0.append(x1),
      _397: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _398: x0 => x0.preventDefault(),
      _399: x0 => x0.preventDefault(),
      _400: x0 => x0.preventDefault(),
      _401: x0 => x0.preventDefault(),
      _402: x0 => x0.remove(),
      _403: (x0,x1) => x0.observe(x1),
      _404: x0 => x0.disconnect(),
      _405: (x0,x1) => x0.appendChild(x1),
      _406: (x0,x1) => x0.appendChild(x1),
      _407: (x0,x1) => x0.appendChild(x1),
      _408: (x0,x1) => x0.append(x1),
      _409: x0 => x0.remove(),
      _410: (x0,x1) => x0.append(x1),
      _412: (x0,x1) => x0.appendChild(x1),
      _413: (x0,x1) => x0.append(x1),
      _414: x0 => x0.remove(),
      _415: (x0,x1) => x0.append(x1),
      _419: (x0,x1) => x0.appendChild(x1),
      _420: x0 => x0.remove(),
      _976: () => globalThis.window.flutterConfiguration,
      _977: x0 => x0.assetBase,
      _982: x0 => x0.debugShowSemanticsNodes,
      _983: x0 => x0.hostElement,
      _984: x0 => x0.multiViewEnabled,
      _985: x0 => x0.nonce,
      _987: x0 => x0.fontFallbackBaseUrl,
      _988: x0 => x0.useColorEmoji,
      _992: x0 => x0.console,
      _993: x0 => x0.devicePixelRatio,
      _994: x0 => x0.document,
      _995: x0 => x0.history,
      _996: x0 => x0.innerHeight,
      _997: x0 => x0.innerWidth,
      _998: x0 => x0.location,
      _999: x0 => x0.navigator,
      _1000: x0 => x0.visualViewport,
      _1001: x0 => x0.performance,
      _1004: (x0,x1) => x0.dispatchEvent(x1),
      _1005: (x0,x1) => x0.matchMedia(x1),
      _1007: (x0,x1) => x0.getComputedStyle(x1),
      _1008: x0 => x0.screen,
      _1009: (x0,x1) => x0.requestAnimationFrame(x1),
      _1010: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1010(f,arguments.length,x0) }),
      _1014: (x0,x1) => x0.warn(x1),
      _1017: () => globalThis.window,
      _1018: () => globalThis.Intl,
      _1019: () => globalThis.Symbol,
      _1022: x0 => x0.clipboard,
      _1023: x0 => x0.maxTouchPoints,
      _1024: x0 => x0.vendor,
      _1025: x0 => x0.language,
      _1026: x0 => x0.platform,
      _1027: x0 => x0.userAgent,
      _1028: x0 => x0.languages,
      _1029: x0 => x0.documentElement,
      _1030: (x0,x1) => x0.querySelector(x1),
      _1034: (x0,x1) => x0.createElement(x1),
      _1035: (x0,x1) => x0.execCommand(x1),
      _1039: (x0,x1) => x0.createTextNode(x1),
      _1040: (x0,x1) => x0.createEvent(x1),
      _1044: x0 => x0.head,
      _1045: x0 => x0.body,
      _1046: (x0,x1) => x0.title = x1,
      _1049: x0 => x0.activeElement,
      _1052: x0 => x0.visibilityState,
      _1053: x0 => x0.hasFocus(),
      _1054: () => globalThis.document,
      _1055: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      _1057: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      _1060: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1060(f,arguments.length,x0) }),
      _1061: x0 => x0.target,
      _1063: x0 => x0.timeStamp,
      _1064: x0 => x0.type,
      _1066: x0 => x0.preventDefault(),
      _1068: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      _1075: x0 => x0.firstChild,
      _1080: x0 => x0.parentElement,
      _1082: x0 => x0.parentNode,
      _1085: (x0,x1) => x0.removeChild(x1),
      _1086: (x0,x1) => x0.removeChild(x1),
      _1087: x0 => x0.isConnected,
      _1088: (x0,x1) => x0.textContent = x1,
      _1090: (x0,x1) => x0.contains(x1),
      _1095: x0 => x0.firstElementChild,
      _1097: x0 => x0.nextElementSibling,
      _1098: x0 => x0.clientHeight,
      _1099: x0 => x0.clientWidth,
      _1100: x0 => x0.offsetHeight,
      _1101: x0 => x0.offsetWidth,
      _1102: x0 => x0.id,
      _1103: (x0,x1) => x0.id = x1,
      _1106: (x0,x1) => x0.spellcheck = x1,
      _1107: x0 => x0.tagName,
      _1108: x0 => x0.style,
      _1109: (x0,x1) => x0.append(x1),
      _1110: (x0,x1) => x0.getAttribute(x1),
      _1111: x0 => x0.getBoundingClientRect(),
      _1116: (x0,x1) => x0.closest(x1),
      _1119: (x0,x1) => x0.querySelectorAll(x1),
      _1121: x0 => x0.remove(),
      _1122: (x0,x1,x2) => x0.setAttribute(x1,x2),
      _1123: (x0,x1) => x0.removeAttribute(x1),
      _1124: (x0,x1) => x0.tabIndex = x1,
      _1126: (x0,x1) => x0.focus(x1),
      _1127: x0 => x0.scrollTop,
      _1128: (x0,x1) => x0.scrollTop = x1,
      _1129: x0 => x0.scrollLeft,
      _1130: (x0,x1) => x0.scrollLeft = x1,
      _1131: x0 => x0.classList,
      _1132: (x0,x1) => x0.className = x1,
      _1139: (x0,x1) => x0.getElementsByClassName(x1),
      _1141: x0 => x0.click(),
      _1143: (x0,x1) => x0.hasAttribute(x1),
      _1146: (x0,x1) => x0.attachShadow(x1),
      _1151: (x0,x1) => x0.getPropertyValue(x1),
      _1153: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      _1155: (x0,x1) => x0.removeProperty(x1),
      _1157: x0 => x0.offsetLeft,
      _1158: x0 => x0.offsetTop,
      _1159: x0 => x0.offsetParent,
      _1161: (x0,x1) => x0.name = x1,
      _1162: x0 => x0.content,
      _1163: (x0,x1) => x0.content = x1,
      _1177: (x0,x1) => x0.nonce = x1,
      _1183: x0 => x0.now(),
      _1185: (x0,x1) => x0.width = x1,
      _1187: (x0,x1) => x0.height = x1,
      _1191: (x0,x1) => x0.getContext(x1),
      _1267: (x0,x1) => x0.fetch(x1),
      _1268: x0 => x0.status,
      _1269: x0 => x0.headers,
      _1270: x0 => x0.body,
      _1271: x0 => x0.arrayBuffer(),
      _1274: (x0,x1) => x0.get(x1),
      _1277: x0 => x0.read(),
      _1278: x0 => x0.value,
      _1279: x0 => x0.done,
      _1281: x0 => x0.name,
      _1282: x0 => x0.x,
      _1283: x0 => x0.y,
      _1286: x0 => x0.top,
      _1287: x0 => x0.right,
      _1288: x0 => x0.bottom,
      _1289: x0 => x0.left,
      _1299: x0 => x0.height,
      _1300: x0 => x0.width,
      _1301: (x0,x1) => x0.value = x1,
      _1303: (x0,x1) => x0.placeholder = x1,
      _1304: (x0,x1) => x0.name = x1,
      _1305: x0 => x0.selectionDirection,
      _1306: x0 => x0.selectionStart,
      _1307: x0 => x0.selectionEnd,
      _1310: x0 => x0.value,
      _1312: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      _1315: x0 => x0.readText(),
      _1316: (x0,x1) => x0.writeText(x1),
      _1317: x0 => x0.altKey,
      _1318: x0 => x0.code,
      _1319: x0 => x0.ctrlKey,
      _1320: x0 => x0.key,
      _1321: x0 => x0.keyCode,
      _1322: x0 => x0.location,
      _1323: x0 => x0.metaKey,
      _1324: x0 => x0.repeat,
      _1325: x0 => x0.shiftKey,
      _1326: x0 => x0.isComposing,
      _1327: (x0,x1) => x0.getModifierState(x1),
      _1329: x0 => x0.state,
      _1330: (x0,x1) => x0.go(x1),
      _1333: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      _1334: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      _1335: x0 => x0.pathname,
      _1336: x0 => x0.search,
      _1337: x0 => x0.hash,
      _1341: x0 => x0.state,
      _1347: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1347(f,arguments.length,x0,x1) }),
      _1350: (x0,x1,x2) => x0.observe(x1,x2),
      _1353: x0 => x0.attributeName,
      _1354: x0 => x0.type,
      _1355: x0 => x0.matches,
      _1358: x0 => x0.matches,
      _1360: x0 => x0.relatedTarget,
      _1361: x0 => x0.clientX,
      _1362: x0 => x0.clientY,
      _1363: x0 => x0.offsetX,
      _1364: x0 => x0.offsetY,
      _1367: x0 => x0.button,
      _1368: x0 => x0.buttons,
      _1369: x0 => x0.ctrlKey,
      _1370: (x0,x1) => x0.getModifierState(x1),
      _1373: x0 => x0.pointerId,
      _1374: x0 => x0.pointerType,
      _1375: x0 => x0.pressure,
      _1376: x0 => x0.tiltX,
      _1377: x0 => x0.tiltY,
      _1378: x0 => x0.getCoalescedEvents(),
      _1380: x0 => x0.deltaX,
      _1381: x0 => x0.deltaY,
      _1382: x0 => x0.wheelDeltaX,
      _1383: x0 => x0.wheelDeltaY,
      _1384: x0 => x0.deltaMode,
      _1390: x0 => x0.changedTouches,
      _1392: x0 => x0.clientX,
      _1393: x0 => x0.clientY,
      _1395: x0 => x0.data,
      _1398: (x0,x1) => x0.disabled = x1,
      _1399: (x0,x1) => x0.type = x1,
      _1400: (x0,x1) => x0.max = x1,
      _1401: (x0,x1) => x0.min = x1,
      _1402: (x0,x1) => x0.value = x1,
      _1403: x0 => x0.value,
      _1404: x0 => x0.disabled,
      _1405: (x0,x1) => x0.disabled = x1,
      _1406: (x0,x1) => x0.placeholder = x1,
      _1407: (x0,x1) => x0.name = x1,
      _1408: (x0,x1) => x0.autocomplete = x1,
      _1409: x0 => x0.selectionDirection,
      _1410: x0 => x0.selectionStart,
      _1411: x0 => x0.selectionEnd,
      _1415: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      _1420: (x0,x1) => x0.add(x1),
      _1423: (x0,x1) => x0.noValidate = x1,
      _1424: (x0,x1) => x0.method = x1,
      _1425: (x0,x1) => x0.action = x1,
      _1450: x0 => x0.orientation,
      _1451: x0 => x0.width,
      _1452: x0 => x0.height,
      _1453: (x0,x1) => x0.lock(x1),
      _1471: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1471(f,arguments.length,x0,x1) }),
      _1482: x0 => x0.length,
      _1483: (x0,x1) => x0.item(x1),
      _1484: x0 => x0.length,
      _1485: (x0,x1) => x0.item(x1),
      _1486: x0 => x0.iterator,
      _1487: x0 => x0.Segmenter,
      _1488: x0 => x0.v8BreakIterator,
      _1492: x0 => x0.done,
      _1493: x0 => x0.value,
      _1494: x0 => x0.index,
      _1498: (x0,x1) => x0.adoptText(x1),
      _1499: x0 => x0.first(),
      _1500: x0 => x0.next(),
      _1501: x0 => x0.current(),
      _1512: x0 => x0.hostElement,
      _1513: x0 => x0.viewConstraints,
      _1515: x0 => x0.maxHeight,
      _1516: x0 => x0.maxWidth,
      _1517: x0 => x0.minHeight,
      _1518: x0 => x0.minWidth,
      _1519: x0 => x0.loader,
      _1520: () => globalThis._flutter,
      _1521: (x0,x1) => x0.didCreateEngineInitializer(x1),
      _1522: (x0,x1,x2) => x0.call(x1,x2),
      _1523: () => globalThis.Promise,
      _1524: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1524(f,arguments.length,x0,x1) }),
      _1527: x0 => x0.length,
      _1530: x0 => x0.tracks,
      _1534: x0 => x0.image,
      _1539: x0 => x0.codedWidth,
      _1540: x0 => x0.codedHeight,
      _1543: x0 => x0.duration,
      _1547: x0 => x0.ready,
      _1548: x0 => x0.selectedTrack,
      _1549: x0 => x0.repetitionCount,
      _1550: x0 => x0.frameCount,
      _1595: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      _1596: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      _1597: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1597(f,arguments.length,x0) }),
      _1598: (x0,x1,x2) => x0.addEventListener(x1,x2),
      _1599: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1599(f,arguments.length,x0) }),
      _1600: x0 => x0.send(),
      _1601: () => new XMLHttpRequest(),
      _1612: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      _1614: (x0,x1) => x0.createElement(x1),
      _1622: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      _1637: (x0,x1) => x0.querySelector(x1),
      _1638: (x0,x1) => x0.getAttribute(x1),
      _1639: (x0,x1,x2) => x0.setAttribute(x1,x2),
      _1641: (x0,x1) => x0.initialize(x1),
      _1642: (x0,x1) => x0.initTokenClient(x1),
      _1643: (x0,x1) => x0.initCodeClient(x1),
      _1645: (x0,x1) => x0.warn(x1),
      _1646: x0 => x0.disableAutoSelect(),
      _1647: x0 => x0.delete(),
      _1649: (x0,x1) => globalThis.firebase_auth.linkWithCredential(x0,x1),
      _1650: (x0,x1,x2) => globalThis.firebase_auth.linkWithPhoneNumber(x0,x1,x2),
      _1657: x0 => x0.reload(),
      _1658: (x0,x1) => globalThis.firebase_auth.sendEmailVerification(x0,x1),
      _1660: (x0,x1) => globalThis.firebase_auth.unlink(x0,x1),
      _1664: (x0,x1) => globalThis.firebase_auth.updateProfile(x0,x1),
      _1667: x0 => x0.toJSON(),
      _1668: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1668(f,arguments.length,x0) }),
      _1669: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1669(f,arguments.length,x0) }),
      _1670: (x0,x1,x2) => x0.onAuthStateChanged(x1,x2),
      _1671: x0 => x0.call(),
      _1672: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1672(f,arguments.length,x0) }),
      _1673: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1673(f,arguments.length,x0) }),
      _1674: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1674(f,arguments.length,x0) }),
      _1675: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1675(f,arguments.length,x0) }),
      _1676: (x0,x1,x2) => x0.onIdTokenChanged(x1,x2),
      _1677: (x0,x1) => globalThis.firebase_auth.applyActionCode(x0,x1),
      _1678: (x0,x1) => globalThis.firebase_auth.checkActionCode(x0,x1),
      _1680: (x0,x1,x2) => globalThis.firebase_auth.createUserWithEmailAndPassword(x0,x1,x2),
      _1686: (x0,x1,x2) => globalThis.firebase_auth.sendPasswordResetEmail(x0,x1,x2),
      _1687: (x0,x1) => globalThis.firebase_auth.signInWithCredential(x0,x1),
      _1692: (x0,x1,x2) => globalThis.firebase_auth.signInWithPhoneNumber(x0,x1,x2),
      _1695: x0 => x0.signOut(),
      _1696: (x0,x1) => globalThis.firebase_auth.connectAuthEmulator(x0,x1),
      _1700: (x0,x1) => globalThis.firebase_auth.EmailAuthProvider.credential(x0,x1),
      _1713: (x0,x1) => globalThis.firebase_auth.GoogleAuthProvider.credential(x0,x1),
      _1714: x0 => new firebase_auth.OAuthProvider(x0),
      _1717: (x0,x1) => x0.credential(x1),
      _1718: x0 => globalThis.firebase_auth.OAuthProvider.credentialFromResult(x0),
      _1724: x0 => new firebase_auth.PhoneAuthProvider(x0),
      _1725: () => new firebase_auth.PhoneAuthProvider(),
      _1726: (x0,x1,x2) => x0.verifyPhoneNumber(x1,x2),
      _1727: (x0,x1) => globalThis.firebase_auth.PhoneAuthProvider.credential(x0,x1),
      _1729: (x0,x1,x2) => new firebase_auth.RecaptchaVerifier(x0,x1,x2),
      _1730: x0 => x0.clear(),
      _1732: (x0,x1) => x0.confirm(x1),
      _1733: x0 => globalThis.firebase_auth.getAdditionalUserInfo(x0),
      _1734: (x0,x1,x2) => ({errorMap: x0,persistence: x1,popupRedirectResolver: x2}),
      _1735: (x0,x1) => globalThis.firebase_auth.initializeAuth(x0,x1),
      _1736: (x0,x1,x2) => ({accessToken: x0,idToken: x1,rawNonce: x2}),
      _1751: x0 => globalThis.firebase_auth.OAuthProvider.credentialFromError(x0),
      _1760: (x0,x1) => ({displayName: x0,photoURL: x1}),
      _1765: x0 => globalThis.firebase_auth.PhoneMultiFactorGenerator.assertion(x0),
      _1773: () => globalThis.firebase_auth.debugErrorMap,
      _1777: () => globalThis.firebase_auth.browserSessionPersistence,
      _1779: () => globalThis.firebase_auth.browserLocalPersistence,
      _1781: () => globalThis.firebase_auth.indexedDBLocalPersistence,
      _1816: x0 => globalThis.firebase_auth.multiFactor(x0),
      _1817: (x0,x1) => globalThis.firebase_auth.getMultiFactorResolver(x0,x1),
      _1819: x0 => x0.currentUser,
      _1823: x0 => x0.tenantId,
      _1834: x0 => x0.displayName,
      _1835: x0 => x0.email,
      _1836: x0 => x0.phoneNumber,
      _1837: x0 => x0.photoURL,
      _1838: x0 => x0.providerId,
      _1839: x0 => x0.uid,
      _1840: x0 => x0.emailVerified,
      _1841: x0 => x0.isAnonymous,
      _1842: x0 => x0.providerData,
      _1843: x0 => x0.refreshToken,
      _1844: x0 => x0.tenantId,
      _1845: x0 => x0.metadata,
      _1850: x0 => x0.providerId,
      _1851: x0 => x0.signInMethod,
      _1852: x0 => x0.accessToken,
      _1853: x0 => x0.idToken,
      _1854: x0 => x0.secret,
      _1878: x0 => x0.verificationId,
      _1880: x0 => x0.data,
      _1881: x0 => x0.creationTime,
      _1882: x0 => x0.lastSignInTime,
      _1887: x0 => x0.code,
      _1889: x0 => x0.message,
      _1901: x0 => x0.email,
      _1902: x0 => x0.phoneNumber,
      _1903: x0 => x0.tenantId,
      _1904: x0 => x0.email,
      _1905: x0 => x0.previousEmail,
      _1924: x0 => x0.user,
      _1927: x0 => x0.providerId,
      _1928: x0 => x0.profile,
      _1929: x0 => x0.username,
      _1930: x0 => x0.isNewUser,
      _1933: () => globalThis.firebase_auth.browserPopupRedirectResolver,
      _1934: x0 => x0.enrolledFactors,
      _1935: (x0,x1,x2) => x0.enroll(x1,x2),
      _1937: x0 => x0.getSession(),
      _1938: (x0,x1) => x0.unenroll(x1),
      _1939: x0 => x0.displayName,
      _1940: x0 => x0.enrollmentTime,
      _1941: x0 => x0.factorId,
      _1942: x0 => x0.uid,
      _1944: x0 => x0.hints,
      _1945: x0 => x0.session,
      _1946: (x0,x1) => x0.resolveSignIn(x1),
      _1947: x0 => x0.phoneNumber,
      _1957: x0 => ({displayName: x0}),
      _1958: x0 => ({photoURL: x0}),
      _1959: (x0,x1) => x0.getItem(x1),
      _1964: (x0,x1) => x0.getElementById(x1),
      _1965: x0 => x0.remove(),
      _1966: (x0,x1) => x0.appendChild(x1),
      _1967: (x0,x1) => x0.getElementById(x1),
      _1968: x0 => x0.remove(),
      _1971: () => globalThis.firebase_core.getApps(),
      _1972: (x0,x1,x2,x3,x4,x5,x6,x7) => ({apiKey: x0,authDomain: x1,databaseURL: x2,projectId: x3,storageBucket: x4,messagingSenderId: x5,measurementId: x6,appId: x7}),
      _1973: (x0,x1) => globalThis.firebase_core.initializeApp(x0,x1),
      _1974: x0 => globalThis.firebase_core.getApp(x0),
      _1975: () => globalThis.firebase_core.getApp(),
      _1978: () => globalThis.firebase_core.SDK_VERSION,
      _1985: x0 => x0.apiKey,
      _1987: x0 => x0.authDomain,
      _1989: x0 => x0.databaseURL,
      _1991: x0 => x0.projectId,
      _1993: x0 => x0.storageBucket,
      _1995: x0 => x0.messagingSenderId,
      _1997: x0 => x0.measurementId,
      _1999: x0 => x0.appId,
      _2001: x0 => x0.name,
      _2002: x0 => x0.options,
      _2003: (x0,x1) => x0.debug(x1),
      _2004: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2004(f,arguments.length,x0) }),
      _2005: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._2005(f,arguments.length,x0,x1) }),
      _2006: (x0,x1) => ({createScript: x0,createScriptURL: x1}),
      _2007: (x0,x1,x2) => x0.createPolicy(x1,x2),
      _2008: (x0,x1) => x0.createScriptURL(x1),
      _2009: (x0,x1,x2) => x0.createScript(x1,x2),
      _2010: (x0,x1) => x0.appendChild(x1),
      _2011: (x0,x1) => x0.appendChild(x1),
      _2012: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2012(f,arguments.length,x0) }),
      _2026: x0 => new Array(x0),
      _2028: x0 => x0.length,
      _2030: (x0,x1) => x0[x1],
      _2031: (x0,x1,x2) => x0[x1] = x2,
      _2034: (x0,x1,x2) => new DataView(x0,x1,x2),
      _2036: x0 => new Int8Array(x0),
      _2037: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      _2038: x0 => new Uint8Array(x0),
      _2044: x0 => new Uint16Array(x0),
      _2046: x0 => new Int32Array(x0),
      _2048: x0 => new Uint32Array(x0),
      _2050: x0 => new Float32Array(x0),
      _2052: x0 => new Float64Array(x0),
      _2058: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2058(f,arguments.length,x0) }),
      _2059: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2059(f,arguments.length,x0) }),
      _2084: (decoder, codeUnits) => decoder.decode(codeUnits),
      _2085: () => new TextDecoder("utf-8", {fatal: true}),
      _2086: () => new TextDecoder("utf-8", {fatal: false}),
      _2087: x0 => new WeakRef(x0),
      _2088: x0 => x0.deref(),
      _2094: Date.now,
      _2096: s => new Date(s * 1000).getTimezoneOffset() * 60,
      _2097: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      _2098: () => {
        let stackString = new Error().stack.toString();
        let frames = stackString.split('\n');
        let drop = 2;
        if (frames[0] === 'Error') {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      _2099: () => typeof dartUseDateNowForTicks !== "undefined",
      _2100: () => 1000 * performance.now(),
      _2101: () => Date.now(),
      _2102: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      _2103: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      _2104: () => new WeakMap(),
      _2105: (map, o) => map.get(o),
      _2106: (map, o, v) => map.set(o, v),
      _2107: () => globalThis.WeakRef,
      _2117: s => JSON.stringify(s),
      _2118: s => printToConsole(s),
      _2119: a => a.join(''),
      _2120: (o, a, b) => o.replace(a, b),
      _2122: (s, t) => s.split(t),
      _2123: s => s.toLowerCase(),
      _2124: s => s.toUpperCase(),
      _2125: s => s.trim(),
      _2126: s => s.trimLeft(),
      _2127: s => s.trimRight(),
      _2129: (s, p, i) => s.indexOf(p, i),
      _2130: (s, p, i) => s.lastIndexOf(p, i),
      _2131: (s) => s.replace(/\$/g, "$$$$"),
      _2132: Object.is,
      _2133: s => s.toUpperCase(),
      _2134: s => s.toLowerCase(),
      _2135: (a, i) => a.push(i),
      _2139: a => a.pop(),
      _2140: (a, i) => a.splice(i, 1),
      _2142: (a, s) => a.join(s),
      _2143: (a, s, e) => a.slice(s, e),
      _2145: (a, b) => a == b ? 0 : (a > b ? 1 : -1),
      _2146: a => a.length,
      _2148: (a, i) => a[i],
      _2149: (a, i, v) => a[i] = v,
      _2151: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      _2152: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      _2153: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      _2154: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      _2155: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      _2156: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      _2157: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      _2158: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      _2160: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      _2161: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      _2162: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      _2163: (t, s) => t.set(s),
      _2164: l => new DataView(new ArrayBuffer(l)),
      _2165: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      _2167: o => o.buffer,
      _2168: o => o.byteOffset,
      _2169: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      _2170: (b, o) => new DataView(b, o),
      _2171: (b, o, l) => new DataView(b, o, l),
      _2172: Function.prototype.call.bind(DataView.prototype.getUint8),
      _2173: Function.prototype.call.bind(DataView.prototype.setUint8),
      _2174: Function.prototype.call.bind(DataView.prototype.getInt8),
      _2175: Function.prototype.call.bind(DataView.prototype.setInt8),
      _2176: Function.prototype.call.bind(DataView.prototype.getUint16),
      _2177: Function.prototype.call.bind(DataView.prototype.setUint16),
      _2178: Function.prototype.call.bind(DataView.prototype.getInt16),
      _2179: Function.prototype.call.bind(DataView.prototype.setInt16),
      _2180: Function.prototype.call.bind(DataView.prototype.getUint32),
      _2181: Function.prototype.call.bind(DataView.prototype.setUint32),
      _2182: Function.prototype.call.bind(DataView.prototype.getInt32),
      _2183: Function.prototype.call.bind(DataView.prototype.setInt32),
      _2186: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      _2187: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      _2188: Function.prototype.call.bind(DataView.prototype.getFloat32),
      _2189: Function.prototype.call.bind(DataView.prototype.setFloat32),
      _2190: Function.prototype.call.bind(DataView.prototype.getFloat64),
      _2191: Function.prototype.call.bind(DataView.prototype.setFloat64),
      _2204: (o, t) => o instanceof t,
      _2206: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2206(f,arguments.length,x0) }),
      _2207: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2207(f,arguments.length,x0) }),
      _2208: o => Object.keys(o),
      _2209: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      _2210: (handle) => clearTimeout(handle),
      _2211: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      _2212: (handle) => clearInterval(handle),
      _2213: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      _2214: () => Date.now(),
      _2215: () => new XMLHttpRequest(),
      _2216: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      _2217: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      _2218: (x0,x1) => x0.send(x1),
      _2219: x0 => x0.abort(),
      _2220: x0 => x0.getAllResponseHeaders(),
      _2228: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2228(f,arguments.length,x0) }),
      _2234: x0 => x0.trustedTypes,
      _2235: (x0,x1) => x0.src = x1,
      _2236: (x0,x1) => x0.createScriptURL(x1),
      _2237: x0 => x0.nonce,
      _2238: (x0,x1) => x0.debug(x1),
      _2239: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2239(f,arguments.length,x0) }),
      _2240: x0 => ({createScriptURL: x0}),
      _2241: (x0,x1) => x0.appendChild(x1),
      _2242: (x0,x1) => x0.querySelectorAll(x1),
      _2243: (x0,x1) => x0.item(x1),
      _2244: (x0,x1) => x0.getAttribute(x1),
      _2245: x0 => x0.trustedTypes,
      _2247: (x0,x1) => x0.text = x1,
      _2263: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      _2264: (x0,x1) => x0.exec(x1),
      _2265: (x0,x1) => x0.test(x1),
      _2266: (x0,x1) => x0.exec(x1),
      _2267: (x0,x1) => x0.exec(x1),
      _2268: x0 => x0.pop(),
      _2270: o => o === undefined,
      _2289: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      _2291: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      _2292: o => o instanceof RegExp,
      _2293: (l, r) => l === r,
      _2294: o => o,
      _2295: o => o,
      _2296: o => o,
      _2297: b => !!b,
      _2298: o => o.length,
      _2301: (o, i) => o[i],
      _2302: f => f.dartFunction,
      _2303: l => arrayFromDartList(Int8Array, l),
      _2304: l => arrayFromDartList(Uint8Array, l),
      _2305: l => arrayFromDartList(Uint8ClampedArray, l),
      _2306: l => arrayFromDartList(Int16Array, l),
      _2307: l => arrayFromDartList(Uint16Array, l),
      _2308: l => arrayFromDartList(Int32Array, l),
      _2309: l => arrayFromDartList(Uint32Array, l),
      _2310: l => arrayFromDartList(Float32Array, l),
      _2311: l => arrayFromDartList(Float64Array, l),
      _2312: x0 => new ArrayBuffer(x0),
      _2313: (data, length) => {
        const getValue = dartInstance.exports.$byteDataGetUint8;
        const view = new DataView(new ArrayBuffer(length));
        for (let i = 0; i < length; i++) {
          view.setUint8(i, getValue(data, i));
        }
        return view;
      },
      _2314: l => arrayFromDartList(Array, l),
      _2315: (s, length) => {
        if (length == 0) return '';
      
        const read = dartInstance.exports.$stringRead1;
        let result = '';
        let index = 0;
        const chunkLength = Math.min(length - index, 500);
        let array = new Array(chunkLength);
        while (index < length) {
          const newChunkLength = Math.min(length - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(s, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
      _2316: (s, length) => {
        if (length == 0) return '';
      
        const read = dartInstance.exports.$stringRead2;
        let result = '';
        let index = 0;
        const chunkLength = Math.min(length - index, 500);
        let array = new Array(chunkLength);
        while (index < length) {
          const newChunkLength = Math.min(length - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(s, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
      _2317: (s) => {
        let length = s.length;
        let range = 0;
        for (let i = 0; i < length; i++) {
          range |= s.codePointAt(i);
        }
        const exports = dartInstance.exports;
        if (range < 256) {
          if (length <= 10) {
            if (length == 1) {
              return exports.$stringAllocate1_1(s.codePointAt(0));
            }
            if (length == 2) {
              return exports.$stringAllocate1_2(s.codePointAt(0), s.codePointAt(1));
            }
            if (length == 3) {
              return exports.$stringAllocate1_3(s.codePointAt(0), s.codePointAt(1), s.codePointAt(2));
            }
            if (length == 4) {
              return exports.$stringAllocate1_4(s.codePointAt(0), s.codePointAt(1), s.codePointAt(2), s.codePointAt(3));
            }
            if (length == 5) {
              return exports.$stringAllocate1_5(s.codePointAt(0), s.codePointAt(1), s.codePointAt(2), s.codePointAt(3), s.codePointAt(4));
            }
            if (length == 6) {
              return exports.$stringAllocate1_6(s.codePointAt(0), s.codePointAt(1), s.codePointAt(2), s.codePointAt(3), s.codePointAt(4), s.codePointAt(5));
            }
            if (length == 7) {
              return exports.$stringAllocate1_7(s.codePointAt(0), s.codePointAt(1), s.codePointAt(2), s.codePointAt(3), s.codePointAt(4), s.codePointAt(5), s.codePointAt(6));
            }
            if (length == 8) {
              return exports.$stringAllocate1_8(s.codePointAt(0), s.codePointAt(1), s.codePointAt(2), s.codePointAt(3), s.codePointAt(4), s.codePointAt(5), s.codePointAt(6), s.codePointAt(7));
            }
            if (length == 9) {
              return exports.$stringAllocate1_9(s.codePointAt(0), s.codePointAt(1), s.codePointAt(2), s.codePointAt(3), s.codePointAt(4), s.codePointAt(5), s.codePointAt(6), s.codePointAt(7), s.codePointAt(8));
            }
            if (length == 10) {
              return exports.$stringAllocate1_10(s.codePointAt(0), s.codePointAt(1), s.codePointAt(2), s.codePointAt(3), s.codePointAt(4), s.codePointAt(5), s.codePointAt(6), s.codePointAt(7), s.codePointAt(8), s.codePointAt(9));
            }
          }
          const dartString = exports.$stringAllocate1(length);
          const write = exports.$stringWrite1;
          for (let i = 0; i < length; i++) {
            write(dartString, i, s.codePointAt(i));
          }
          return dartString;
        } else {
          const dartString = exports.$stringAllocate2(length);
          const write = exports.$stringWrite2;
          for (let i = 0; i < length; i++) {
            write(dartString, i, s.charCodeAt(i));
          }
          return dartString;
        }
      },
      _2318: () => ({}),
      _2319: () => [],
      _2320: l => new Array(l),
      _2321: () => globalThis,
      _2322: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      _2323: (o, p) => p in o,
      _2324: (o, p) => o[p],
      _2325: (o, p, v) => o[p] = v,
      _2326: (o, m, a) => o[m].apply(o, a),
      _2328: o => String(o),
      _2329: (p, s, f) => p.then(s, f),
      _2330: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        return 17;
      },
      _2331: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _2332: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _2333: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI16ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _2334: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI16ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _2335: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _2336: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _2337: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _2338: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _2339: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _2340: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _2341: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      _2344: x0 => x0.index,
      _2345: x0 => x0.groups,
      _2348: (x0,x1) => x0.exec(x1),
      _2350: x0 => x0.flags,
      _2351: x0 => x0.multiline,
      _2352: x0 => x0.ignoreCase,
      _2353: x0 => x0.unicode,
      _2354: x0 => x0.dotAll,
      _2355: (x0,x1) => x0.lastIndex = x1,
      _2357: (o, p) => o[p],
      _2358: (o, p, v) => o[p] = v,
      _2359: (o, p) => delete o[p],
      _2360: v => v.toString(),
      _2361: (d, digits) => d.toFixed(digits),
      _2365: x0 => x0.random(),
      _2366: x0 => x0.random(),
      _2367: (x0,x1) => x0.getRandomValues(x1),
      _2368: () => globalThis.crypto,
      _2370: () => globalThis.Math,
      _2410: x0 => x0.status,
      _2411: (x0,x1) => x0.responseType = x1,
      _2413: x0 => x0.response,
      _2414: () => globalThis.google.accounts.oauth2,
      _2423: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2423(f,arguments.length,x0) }),
      _2424: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2424(f,arguments.length,x0) }),
      _2425: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11,x12) => ({client_id: x0,scope: x1,include_granted_scopes: x2,redirect_uri: x3,callback: x4,state: x5,enable_granular_consent: x6,enable_serial_consent: x7,login_hint: x8,hd: x9,ux_mode: x10,select_account: x11,error_callback: x12}),
      _2427: x0 => x0.code,
      _2430: x0 => x0.error,
      _2433: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2433(f,arguments.length,x0) }),
      _2434: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2434(f,arguments.length,x0) }),
      _2435: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9,x10) => ({client_id: x0,callback: x1,scope: x2,include_granted_scopes: x3,prompt: x4,enable_granular_consent: x5,enable_serial_consent: x6,login_hint: x7,hd: x8,state: x9,error_callback: x10}),
      _2436: x0 => x0.requestAccessToken(),
      _2437: (x0,x1) => x0.requestAccessToken(x1),
      _2440: (x0,x1,x2,x3,x4,x5,x6) => ({scope: x0,include_granted_scopes: x1,prompt: x2,enable_granular_consent: x3,enable_serial_consent: x4,login_hint: x5,state: x6}),
      _2441: x0 => x0.access_token,
      _2442: x0 => x0.expires_in,
      _2445: x0 => x0.token_type,
      _2448: x0 => x0.error,
      _2451: x0 => x0.type,
      _2456: () => globalThis.google.accounts.id,
      _2483: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._2483(f,arguments.length,x0) }),
      _2486: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11,x12,x13,x14,x15,x16) => ({client_id: x0,auto_select: x1,callback: x2,login_uri: x3,native_callback: x4,cancel_on_tap_outside: x5,prompt_parent_id: x6,nonce: x7,context: x8,state_cookie_domain: x9,ux_mode: x10,allowed_parent_origin: x11,intermediate_iframe_close_callback: x12,itp_support: x13,login_hint: x14,hd: x15,use_fedcm_for_prompt: x16}),
      _2507: x0 => x0.error,
      _2509: x0 => x0.credential,
      _2520: x0 => globalThis.onGoogleLibraryLoad = x0,
      _2521: f => finalizeWrapper(f, function() { return dartInstance.exports._2521(f,arguments.length) }),
      _2573: (x0,x1) => x0.withCredentials = x1,
      _2575: x0 => x0.responseURL,
      _2576: x0 => x0.status,
      _2577: x0 => x0.statusText,
      _2579: (x0,x1) => x0.responseType = x1,
      _2580: x0 => x0.response,
      _2859: (x0,x1) => x0.nonce = x1,
      _3905: (x0,x1) => x0.src = x1,
      _3907: (x0,x1) => x0.type = x1,
      _3911: (x0,x1) => x0.async = x1,
      _3913: (x0,x1) => x0.defer = x1,
      _3915: (x0,x1) => x0.crossOrigin = x1,
      _3917: (x0,x1) => x0.text = x1,
      _4392: () => globalThis.window,
      _4435: x0 => x0.document,
      _4438: x0 => x0.location,
      _4457: x0 => x0.navigator,
      _4719: x0 => x0.trustedTypes,
      _4720: x0 => x0.sessionStorage,
      _4736: x0 => x0.hostname,
      _4848: x0 => x0.userAgent,
      _7105: x0 => x0.length,
      _7173: () => globalThis.document,
      _7245: x0 => x0.documentElement,
      _7268: x0 => x0.head,
      _7617: (x0,x1) => x0.id = x1,
      _14122: () => globalThis.console,
      _14151: () => globalThis.window.flutterCanvasKit,
      _14152: () => globalThis.window._flutter_skwasmInstance,
      _14153: x0 => x0.name,
      _14154: x0 => x0.message,
      _14155: x0 => x0.code,
      _14157: x0 => x0.customData,

    };

    const baseImports = {
      dart2wasm: dart2wasm,


      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
    };

    const deferredLibraryHelper = {
      "loadModule": async (moduleName) => {
        if (!loadDeferredWasm) {
          throw "No implementation of loadDeferredWasm provided.";
        }
        const source = await Promise.resolve(loadDeferredWasm(moduleName));
        const module = await ((source instanceof Response)
            ? WebAssembly.compileStreaming(source, this.builtins)
            : WebAssembly.compile(source, this.builtins));
        return await WebAssembly.instantiate(module, {
          ...baseImports,
          ...additionalImports,
          "wasm:js-string": jsStringPolyfill,
          "module0": dartInstance.exports,
        });
      },
    };

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      "deferredLibraryHelper": deferredLibraryHelper,
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}

