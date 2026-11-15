const express=require("express");
const path=require("path");
const crypto=require("crypto");
const app=express();
const PORT=process.env.PORT||3000;
app.use(express.json({limit:"30kb"}));
app.use(express.static(path.join(__dirname,"public")));
const usage=new Map();
const day=()=>new Date().toISOString().slice(0,10);
const ip=req=>(req.headers["x-forwarded-for"]||req.socket.remoteAddress||"visitor").toString().split(",")[0].trim();
function creditsFor(req){const key=ip(req),d=day();let v=usage.get(key);if(!v||v.day!==d){v={day:d,remaining:50,used:0};usage.set(key,v)}return v}
function sign(exp){return crypto.createHmac("sha256",process.env.CREATOR_PASSWORD||"disabled").update("videox-creator:"+exp).digest("hex")}
function creatorOK(req){const raw=req.headers.cookie||"";const m=raw.match(/vx_creator=([^;]+)/);if(!m)return false;const [exp,sig]=m[1].split(".");return !!exp&&Number(exp)>Date.now()&&!!sig&&crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(sign(exp)))}
app.get("/api/status",(req,res)=>{const c=creditsFor(req);res.json({remaining:c.remaining,used:c.used,total:50,date:c.day})});
app.post("/api/video/prepare",(req,res)=>{const prompt=String(req.body.prompt||"").trim().slice(0,1800);if(!prompt)return res.status(400).json({error:"Écris une idée de vidéo."});const c=creditsFor(req);if(c.remaining<25)return res.status(429).json({error:"Tes 50 crédits du jour sont utilisés. Reviens demain.",...c});c.remaining-=25;c.used+=25;res.json({ok:true,remaining:c.remaining,used:c.used,videoPrompt:prompt})});
app.post("/api/image",(req,res)=>{const prompt=String(req.body.prompt||"").trim().slice(0,1200);if(!prompt)return res.status(400).json({error:"Écris une description d'image."});const url="https://image.pollinations.ai/prompt/"+encodeURIComponent(prompt)+"?model=flux&width=768&height=1344&seed="+Math.floor(Math.random()*1e6);res.json({url})});
app.post("/api/creator/login",(req,res)=>{const pass=String(req.body.password||"");const expected=process.env.CREATOR_PASSWORD;if(!expected)return res.status(503).json({error:"Le mot de passe créateur n'est pas configuré sur Render."});const a=Buffer.from(pass),b=Buffer.from(expected);if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return res.status(401).json({error:"Mot de passe incorrect."});const exp=String(Date.now()+8*60*60*1000);res.setHeader("Set-Cookie","vx_creator="+exp+"."+sign(exp)+"; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800");res.json({ok:true})});
app.post("/api/creator/logout",(req,res)=>{res.setHeader("Set-Cookie","vx_creator=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0");res.json({ok:true})});
app.get("/api/creator/stats",(req,res)=>{if(!creatorOK(req))return res.status(401).json({error:"Connexion créateur requise."});let total=0,visitors=0;for(const v of usage.values()){if(v.day===day()){total+=v.used;visitors++}}res.json({visitors,creditsUsed:total,activeDay:day(),dailyAllowance:50})});
app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(PORT,()=>console.log("VIDEOX AI lancé sur le port "+PORT));
