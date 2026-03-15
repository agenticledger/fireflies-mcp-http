/**
 * Fireflies.ai GraphQL API Client
 * Endpoint: https://api.fireflies.ai/graphql
 * Auth: Bearer Token (API Key)
 */

const DEFAULT_ENDPOINT = 'https://api.fireflies.ai/graphql';

export class FirefliesClient {
  private apiKey: string;
  private endpoint: string;

  constructor(apiKey: string, endpoint?: string) {
    this.apiKey = apiKey;
    this.endpoint = endpoint || DEFAULT_ENDPOINT;
  }

  async query<T = any>(gql: string, variables?: Record<string, any>): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query: gql, variables }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API Error ${response.status}: ${text}`);
    }

    const json = await response.json() as any;

    if (json.errors && json.errors.length > 0) {
      throw new Error(`GraphQL Error: ${json.errors.map((e: any) => e.message).join('; ')}`);
    }

    return json.data as T;
  }

  // ===== User =====

  async getUser(id?: string) {
    return this.query(`query ($id: String) {
      user(id: $id) {
        user_id
        name
        email
        integrations
        minutes_consumed
        num_transcripts
        is_admin
      }
    }`, id ? { id } : undefined);
  }

  async listUsers() {
    return this.query(`{
      users {
        user_id
        name
        email
        integrations
        minutes_consumed
        num_transcripts
        is_admin
      }
    }`);
  }

  // ===== Transcripts =====

  async listTranscripts(opts?: {
    title?: string;
    keyword?: string;
    limit?: number;
    skip?: number;
    fromDate?: string;
    toDate?: string;
    participantEmail?: string;
    organizerEmail?: string;
    mine?: boolean;
  }) {
    return this.query(`query (
      $title: String, $keyword: String, $limit: Int, $skip: Int,
      $fromDate: DateTime, $toDate: DateTime,
      $participant_email: String, $organizer_email: String, $mine: Boolean
    ) {
      transcripts(
        title: $title, keyword: $keyword, limit: $limit, skip: $skip,
        fromDate: $fromDate, toDate: $toDate,
        participant_email: $participant_email, organizer_email: $organizer_email, mine: $mine
      ) {
        id title date duration organizer_email
        participants fireflies_users
        speakers { id name }
      }
    }`, {
      title: opts?.title,
      keyword: opts?.keyword,
      limit: opts?.limit,
      skip: opts?.skip,
      fromDate: opts?.fromDate,
      toDate: opts?.toDate,
      participant_email: opts?.participantEmail,
      organizer_email: opts?.organizerEmail,
      mine: opts?.mine,
    });
  }

  async getTranscript(id: string) {
    return this.query(`query ($id: String!) {
      transcript(id: $id) {
        id title date duration organizer_email
        participants fireflies_users
        summary {
          action_items keywords overview
          shorthand_bullet short_summary
        }
        sentences {
          text speaker_name speaker_id
          start_time end_time raw_text
        }
        speakers { id name }
      }
    }`, { id });
  }

  // ===== Active Meetings =====

  async listActiveMeetings() {
    return this.query(`{
      active_meetings {
        id title organizer_email meeting_link
        start_time end_time privacy state
      }
    }`);
  }

  // ===== Analytics =====

  async getAnalytics(startTime?: string, endTime?: string) {
    return this.query(`query ($start_time: String, $end_time: String) {
      analytics(start_time: $start_time, end_time: $end_time) {
        team {
          conversation {
            total_meetings_count
            teammates_count
            total_questions
            average_words_per_minute
            average_talk_listen_ratio
          }
          meeting {
            count duration
            average_count average_duration
          }
        }
      }
    }`, { start_time: startTime, end_time: endTime });
  }

  // ===== Channels =====

  async listChannels() {
    return this.query(`{
      channels {
        id title created_at created_by is_private
      }
    }`);
  }

  async getChannel(id: string) {
    return this.query(`query ($id: ID!) {
      channel(id: $id) {
        id title created_at created_by is_private
      }
    }`, { id });
  }

  // ===== Contacts =====

  async listContacts() {
    return this.query(`{
      contacts {
        email name picture last_meeting_date
      }
    }`);
  }

  // ===== Soundbites =====

  async listBites(opts?: { transcriptId?: string; limit?: number; skip?: number; mine?: boolean; myTeam?: boolean }) {
    return this.query(`query ($transcript_id: ID, $limit: Int, $skip: Int, $mine: Boolean, $my_team: Boolean) {
      bites(transcript_id: $transcript_id, limit: $limit, skip: $skip, mine: $mine, my_team: $my_team) {
        id name start_time end_time
        transcript_id summary status
      }
    }`, {
      transcript_id: opts?.transcriptId,
      limit: opts?.limit,
      skip: opts?.skip,
      mine: opts?.mine ?? (!opts?.transcriptId && !opts?.myTeam ? true : undefined),
      my_team: opts?.myTeam,
    });
  }

  async getBite(id: string) {
    return this.query(`query ($id: ID!) {
      bite(id: $id) {
        id name start_time end_time
        transcript_id summary status
      }
    }`, { id });
  }

  // ===== AskFred AI =====

  async listAskFredThreads(transcriptId?: string) {
    return this.query(`query ($transcript_id: String) {
      askfred_threads(transcript_id: $transcript_id) {
        id title transcript_id user_id created_at
      }
    }`, { transcript_id: transcriptId });
  }

  async getAskFredThread(id: string) {
    return this.query(`query ($id: String!) {
      askfred_thread(id: $id) {
        id title transcript_id user_id created_at
        messages {
          id query answer status created_at
          suggested_queries
        }
      }
    }`, { id });
  }

  // ===== Live Action Items =====

  async getLiveActionItems(meetingId: string) {
    return this.query(`query ($meeting_id: ID!) {
      live_action_items(meeting_id: $meeting_id) {
        text
        assignee
        due_date
      }
    }`, { meeting_id: meetingId });
  }

  // ===== Mutations =====

  async uploadAudio(url: string, title?: string) {
    return this.query(`mutation ($input: AudioUploadInput!) {
      uploadAudio(input: $input) {
        success
        title
        message
      }
    }`, {
      input: {
        url,
        ...(title ? { title } : {}),
      },
    });
  }

  async addToLiveMeeting(meetingLink: string, title?: string, duration?: number, language?: string) {
    return this.query(`mutation (
      $meeting_link: String!, $title: String, $duration: Int, $language: String
    ) {
      addToLiveMeeting(
        meeting_link: $meeting_link, title: $title,
        duration: $duration, language: $language
      ) {
        success
        message
      }
    }`, {
      meeting_link: meetingLink,
      title,
      duration,
      language,
    });
  }

  async createBite(transcriptId: string, startTime: number, endTime: number, name?: string, summary?: string) {
    return this.query(`mutation (
      $transcript_Id: ID!, $start_time: Float!, $end_time: Float!,
      $name: String, $summary: String
    ) {
      createBite(
        transcript_Id: $transcript_Id, start_time: $start_time,
        end_time: $end_time, name: $name, summary: $summary
      ) {
        id name start_time end_time summary
      }
    }`, {
      transcript_Id: transcriptId,
      start_time: startTime,
      end_time: endTime,
      name,
      summary,
    });
  }

  async createAskFredThread(question: string, transcriptId?: string) {
    return this.query(`mutation ($input: CreateAskFredThreadInput!) {
      createAskFredThread(input: $input) {
        id
        question
        answer
        created_at
      }
    }`, {
      input: {
        question,
        ...(transcriptId ? { transcript_id: transcriptId } : {}),
      },
    });
  }

  async continueAskFredThread(threadId: string, question: string) {
    return this.query(`mutation ($input: ContinueAskFredThreadInput!) {
      continueAskFredThread(input: $input) {
        id
        question
        answer
        created_at
      }
    }`, {
      input: {
        thread_id: threadId,
        question,
      },
    });
  }

  async updateMeetingTitle(transcriptId: string, title: string) {
    return this.query(`mutation ($input: UpdateMeetingTitleInput!) {
      updateMeetingTitle(input: $input) {
        success
      }
    }`, {
      input: { transcript_id: transcriptId, title },
    });
  }

  async updateMeetingPrivacy(transcriptId: string, isPublic: boolean) {
    return this.query(`mutation ($input: UpdateMeetingPrivacyInput!) {
      updateMeetingPrivacy(input: $input) {
        success
      }
    }`, {
      input: { transcript_id: transcriptId, is_public: isPublic },
    });
  }

  async deleteTranscript(id: string) {
    return this.query(`mutation ($id: String!) {
      deleteTranscript(id: $id) {
        success
      }
    }`, { id });
  }
}
