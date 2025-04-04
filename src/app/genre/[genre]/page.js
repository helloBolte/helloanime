// src/app/genre/[genre]/page.js
import AnimeGenreClient from './AnimeGenreClient';

export default async function AnimeGenrePage({ params }) {
  const { genre } = params; // This now works in an async server component.

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Ad Banner */}
      <div id="frame" className="w-full mb-6">
        <iframe 
          data-aa="2388506" 
          src="//acceptable.a-ads.com/2388506" 
          style={{ border: 0, padding: 0, width: "100%", height: 250, overflow: "hidden", backgroundColor: "transparent" }}
        ></iframe>
        <a className="block text-right text-xs" id="frame-link" href="https://aads.com/campaigns/new/?source_id=2388506&source_type=ad_unit&partner=2388506">
          Advertise here
        </a>
      </div>

      {/* Anime Genre Content */}
      <AnimeGenreClient genre={genre} />

      {/* Second Ad Banner (optional, for bottom placement) */}
      <div id="frame" className="w-full mt-6">
        <iframe 
          data-aa="2388506" 
          src="//acceptable.a-ads.com/2388506" 
          style={{ border: 0, padding: 0, width: "100%", height: 250, overflow: "hidden", backgroundColor: "transparent" }}
        ></iframe>
        <a className="block text-right text-xs" id="frame-link" href="https://aads.com/campaigns/new/?source_id=2388506&source_type=ad_unit&partner=2388506">
          Advertise here
        </a>
      </div>

    </div>
  );
}
