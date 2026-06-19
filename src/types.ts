export interface WordCaption {
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
}

export interface VideoClip {
  id: string;
  title: string;
  description: string;
  start: number; // in seconds
  end: number;   // in seconds
  viralScore: number; // 1-100
  whyViral: string;
  captions: WordCaption[];
}

export interface CaptionStyle {
  fontFamily: string;
  fontSize: number; // in px on standard frame
  uppercase: boolean;
  textColor: string;
  highlightColor: string;
  outlineColor: string;
  outlineWidth: number;
  positionY: number; // % from top, e.g., 75
  scaleOnWord: boolean;
  glowEffect: boolean;
}

export interface VideoSource {
  id: string;
  type: 'youtube' | 'upload';
  title: string;
  urlOrName: string;
  duration: number;
  fileUrl?: string; // object URL or direct source
  thumbnailUrl?: string;
}
