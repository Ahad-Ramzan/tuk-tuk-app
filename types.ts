export interface typeBrand {
  id: number;
  name: string;
  image: string;
  color_scheme: string;
  challenge_count: number;
}

export interface typePrompt {
  prompt_1: string;
  prompt_2: string;
  prompt_3: string;
}


export interface typeTask {
  id: number;
  challenge: number;
  activities: typeActivity[];
}

export interface typeChallengeData {
  id: number;
  name: string;
  language: string;
  time_limit: string;
  assigned_users: number[];
  brand: typeBrand;
  prompt: typePrompt;
  random_order: boolean;
  tasks: typeTask[];
}

export type typeSlide = {
  id: number;
  paragraph: string;
  image: ImageSourcePropType;
};
type ImageSourcePropType = any;

export type typeActivity = {
  id: number;
  prompt: string;
  status: string;
  task_type: string;
  score: number;
  location_lat: number;
  location_lng: number;
  on_app: boolean;
  video_timer: number;
  choice_1: string;
  choice_2: string;
  choice_3: string;
  choice_4: string;
  task: number;
  driver_score?: number;
};

export type typeFoundChallenge = {
  id: number;
  name: string;
  language: string;
  time_limit: string;
  random_order: boolean;
  assigned_users: number[];
  brand: typeBrand;
  prompt: typePrompt;
  tasks: {
    id: number;
    challenge: number;
    activities: typeActivity[];
  }[];
};
