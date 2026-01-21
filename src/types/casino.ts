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
}

export interface CasinoResponse {
  success: boolean;
  msg: string;
  status: number;
  data: {
    t1: CasinoGame[];
  };
}