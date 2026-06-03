import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Auriga Money — Your account for everywhere';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#1C180D',
          padding: '80px',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: '#CCFF00',
              marginRight: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              width={46}
              height={46}
              src={`data:image/svg+xml,${encodeURIComponent(
                "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 168 167'><circle cx='83.5298' cy='35' r='35' fill='#1C180D'/><circle cx='133' cy='84' r='35' fill='#1C180D'/><circle cx='84' cy='132' r='35' fill='#1C180D'/><circle cx='35' cy='84' r='35' fill='#1C180D'/><rect x='83.0833' y='37' width='68' height='68' rx='15' transform='rotate(45 83.0833 37)' fill='#CCFF00'/></svg>",
              )}`}
              alt=""
            />
          </div>
          Auriga Money
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>
            Your account for everywhere
          </div>
          <div style={{ fontSize: 36, color: '#B4B1AB', marginTop: 28 }}>
            EUR IBAN in a minute. Virtual Mastercard instantly.
          </div>
        </div>

        <div style={{ fontSize: 28, color: '#8A8783' }}>The bank for people who live across borders</div>
      </div>
    ),
    { ...size },
  );
}
