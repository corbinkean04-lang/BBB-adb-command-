const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const enableCmd = `settings put global window_animation_scale 0
settings put global transition_animation_scale 0
settings put global animator_duration_scale 0
settings put system peak_refresh_rate 90
settings put system min_refresh_rate 90`;

const resetCmd = `settings put global window_animation_scale 1
settings put global transition_animation_scale 1
settings put global animator_duration_scale 1
settings delete system peak_refresh_rate
settings delete system min_refresh_rate`;

$("#tweakCode").textContent = enableCmd;

const consoleEl = $("#console");
function log(text, cls="") {
  const line = document.createElement("div");
  line.className = cls;
  line.textContent = `${new Date().toLocaleTimeString([], {hour12:false})}  ${text}`;
  consoleEl.appendChild(line);
  consoleEl.scrollTop = consoleEl.scrollHeight;
}
function toast(text){
  const t=$("#toast"); t.textContent=text; t.classList.add("show");
  clearTimeout(window.__toast); window.__toast=setTimeout(()=>t.classList.remove("show"),1600);
}
function download(name, content){
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([content],{type:"text/plain"}));
  a.download=name; a.click(); URL.revokeObjectURL(a.href);
}

log("WebADB Control Center ready. Connect a device to begin.", "log-good");
log("Head Fly mapping: hold Left X to fly up; release X to stop.", "log-dim");

$("#connectBtn").addEventListener("click", async ()=>{
  log("Requesting USB device…");
  if (!("usb" in navigator)) {
    log("WebUSB is unavailable in this browser.", "log-warn");
    toast("WebUSB is unavailable");
    return;
  }
  try {
    const device = await navigator.usb.requestDevice({filters:[]});
    await device.open();
    $("#statusPill").textContent="CONNECTED";
    $("#statusPill").classList.add("connected");
    $("#deviceStatus").textContent = `${device.productName || "USB device"} · ${device.manufacturerName || "Android"}`;
    $("#connectBtn").textContent="Reconnect";
    log(`USB device selected: ${device.productName || "Unknown device"}`, "log-good");
    log("USB transport is ready. Plug in an ADB/WebUSB bridge to execute commands.", "log-dim");
  } catch(e) {
    log(e.name === "NotFoundError" ? "No device selected." : `USB error: ${e.message}`, "log-warn");
  }
});

$("#enableBtn").onclick=()=>{
  $("#tweakCode").textContent=enableCmd;
  log("Enable tweak requested.", "log-good");
  log("Previewing command set — execution adapter not bundled in this UI build.", "log-dim");
};
$("#disableBtn").onclick=()=>{
  $("#tweakCode").textContent=resetCmd;
  log("Reset requested.", "log-good");
};

$("#clearLog").onclick=()=>consoleEl.innerHTML="";

function refreshCommands(){
  const ip=$("#pairIp").value.trim(), pp=$("#pairPort").value.trim(), code=$("#pairCode").value.trim();
  const ci=$("#connectIp").value.trim(), cp=$("#connectPort").value.trim();
  $("#pairCommand").textContent=`adb pair ${ip}:${pp} ${code}`;
  $("#connectCommand").textContent=`adb connect ${ci}:${cp}`;
}
$$("input").forEach(i=>i.addEventListener("input",refreshCommands));

$$("[data-copy]").forEach(btn=>btn.onclick=async()=>{
  const text=$("#"+btn.dataset.copy).textContent;
  await navigator.clipboard?.writeText(text);
  toast("Copied");
});
$("#copyEnable").onclick=async()=>{await navigator.clipboard?.writeText(enableCmd);toast("Enable command copied")};
$("#copyReset").onclick=async()=>{await navigator.clipboard?.writeText(resetCmd);toast("Reset command copied")};

$("#wirelessBat").onclick=()=>download("wireless.bat",
`@echo off
adb pair ${$("#pairIp").value}:${$("#pairPort").value} ${$("#pairCode").value}
adb connect ${$("#connectIp").value}:${$("#connectPort").value}
`);
$("#wirelessSh").onclick=()=>download("wireless.sh",
`#!/usr/bin/env bash
adb pair ${$("#pairIp").value}:${$("#pairPort").value} ${$("#pairCode").value}
adb connect ${$("#connectIp").value}:${$("#connectPort").value}
`);
$("#downloadBat").onclick=()=>download("quest-tweak.bat","@echo off\nadb shell "+enableCmd.split("\n").join(" & adb shell ")+"\n");
$("#downloadSh").onclick=()=>download("quest-tweak.sh","#!/usr/bin/env bash\nadb shell '"+enableCmd.split("\n").join("' && adb shell '")+"' \n");

$("#releaseBtn").onclick=()=>window.open("https://github.com/alt-ctrl/KeyMapper/releases","_blank","noopener");

$$(".accordion").forEach(b=>b.onclick=()=>b.closest(".accordion-panel").classList.toggle("open"));
$$(".sub-accordion").forEach(b=>b.onclick=()=>b.nextElementSibling.classList.toggle("open"));
