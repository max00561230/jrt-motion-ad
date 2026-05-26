import React from "react";
import { Composition } from "remotion";
import { JRTAdVideo } from "./JRTAdVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="JRTAdVideo"
        component={JRTAdVideo}
        durationInFrames={3604}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};