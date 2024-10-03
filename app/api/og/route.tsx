import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
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
    new URL("/public/Spotlight.jpg", import.meta.url),
  ).then(async (res) => {
    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return `data:image/jpeg;base64,${base64}`;
  });

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
        <div tw="flex flex-col justify-center items-center mx-80 mt-96">
          <img
            width="800"
            height="800"
            src={`https://pbs.twimg.com/profile_images/1837747151927185408/2C6--z0u_400x400.jpg`}
          />
          <p tw="text-9xl text-white mt-20 ">x.com/{twitterHandle}</p>
        </div>
        <div
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgb(121, 40, 202), rgb(255, 0, 128))",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            fontSize: "230px",
            bottom: "500px",
            fontFamily: "Manrope-SemiBold",
            position: "absolute",
            width: "50%",
            marginLeft: "320px",
            marginRight: "320px",
          }}
        >
          Social score: 100
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
}
