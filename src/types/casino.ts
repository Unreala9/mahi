export interface CasinoGame {
  cid: number;
  gid: number;
  gmid: string;
  gname: string;
  gtid: number;
  imgpath: string;
  srno: number;
  tabno: number;
  isframe: number;
  tid: number;
  category?: string;
  gameType?: string;
  provider?: string;
  isLive?: boolean;
  isFair?: boolean;
}

export type CasinoTabCategory =
  | "SMART"
  | "OUR"
  | "AVIATOR"
  | "POPOK"
  | "PASCAL"
  | "SCRATCH"
  | "DARWIN"
  | "GEMINI"
  | "STUDIO21"
  | "BEON"
  | "JACKTOP";

export interface CasinoTab {
  id: CasinoTabCategory;
  name: string;
  description: string;
  icon?: string;
}

export interface CasinoResponse {
  success: boolean;
  msg: string;
  status: number;
  data: {
    t1: CasinoGame[];
  };
}
