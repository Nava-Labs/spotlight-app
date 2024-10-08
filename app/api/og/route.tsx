import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const twitterHandle = searchParams.get("twitter_handle");

    if (!twitterHandle) {
      return new ImageResponse(
        <>Visit with &quot;?twitter_handle=vercel&quot;</>,
        {
          width: 4500,
          height: 4500,
        },
      );
    }

    const fontData = await fetch(
      new URL("/app/fonts/Manrope-Bold.ttf", import.meta.url),
    ).then((res) => res.arrayBuffer());
    const spotlightImage = await fetch(
      new URL("/public/Spotlight.png", import.meta.url),
    ).then(async (res) => {
      const arrayBuffer = await res.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      return `data:image/png;base64,${base64}`;
    });

    const getRandomScore = () => {
      return Math.floor(Math.random() * (100 - 80 + 1)) + 80;
    };

    const randomScore = getRandomScore();

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            position: "relative",
          }}
        >
          {/* Background Image */}
          <img
            src={spotlightImage}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <div tw="flex flex-col justify-center items-center mx-auto">
            <p
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgb(121, 40, 202), rgb(255, 0, 128))",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                fontSize: "450px",
                fontFamily: "Manrope-SemiBold",
                justifyContent: "center",
                alignSelf: "center",
              }}
            >
              {randomScore}
            </p>
            <div
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgb(121, 40, 202), rgb(255, 0, 128))",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                fontSize: "200px",
                fontFamily: "Manrope-SemiBold",
                justifyContent: "center",
                alignSelf: "center",
              }}
            >
              Social Score
            </div>

            <img
              width="800"
              height="800"
              src={`https://unavatar.io/twitter/${twitterHandle}`}
              tw="mt-60"
            />
            <p tw="text-9xl text-white mt-20 ">@{twitterHandle}</p>
          </div>
        </div>
      ),
      {
        width: 4500,
        height: 4500,
        fonts: [
          {
            name: "Manrope",
            data: fontData,
            style: "normal",
          },
        ],
      },
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response(`Failed to generate image: ${error}`, {
      status: 500,
    });
  }
}
