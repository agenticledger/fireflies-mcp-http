import { z } from 'zod';
import { FirefliesClient } from './api-client.js';

/**
 * Fireflies.ai MCP Tool Definitions
 * 22 tools covering: User, Transcripts, Meetings, Analytics, Channels,
 * Contacts, Soundbites, AskFred AI, Live Meeting
 */

export const tools = [

  // ===== User =====

  {
    name: 'user_get',
    description: 'Get current user profile or another user by ID',
    inputSchema: z.object({
      user_id: z.string().optional().describe('User ID (omit for current user)'),
    }),
    handler: async (client: FirefliesClient, args: any) => {
      return await client.getUser(args.user_id);
    },
  },

  {
    name: 'users_list',
    description: 'List all team members in the workspace',
    inputSchema: z.object({}),
    handler: async (client: FirefliesClient) => {
      return await client.listUsers();
    },
  },

  // ===== Transcripts =====

  {
    name: 'transcripts_list',
    description: 'List meeting transcripts with optional filters',
    inputSchema: z.object({
      title: z.string().optional().describe('Filter by meeting title'),
      keyword: z.string().optional().describe('Search keyword in transcripts'),
      limit: z.number().optional().describe('Max results to return'),
      skip: z.number().optional().describe('Number of results to skip'),
      from_date: z.string().optional().describe('Start date (ISO 8601)'),
      to_date: z.string().optional().describe('End date (ISO 8601)'),
      participant_email: z.string().optional().describe('Filter by participant email'),
      organizer_email: z.string().optional().describe('Filter by organizer email'),
      mine: z.boolean().optional().describe('Only show my meetings'),
    }),
    handler: async (client: FirefliesClient, args: any) => {
      return await client.listTranscripts({
        title: args.title,
        keyword: args.keyword,
        limit: args.limit,
        skip: args.skip,
        fromDate: args.from_date,
        toDate: args.to_date,
        participantEmail: args.participant_email,
        organizerEmail: args.organizer_email,
        mine: args.mine,
      });
    },
  },

  {
    name: 'transcript_get',
    description: 'Get full transcript with summary and sentences',
    inputSchema: z.object({
      id: z.string().describe('Transcript ID'),
    }),
    handler: async (client: FirefliesClient, args: any) => {
      return await client.getTranscript(args.id);
    },
  },

  {
    name: 'transcript_delete',
    description: 'Delete a transcript permanently',
    inputSchema: z.object({
      id: z.string().describe('Transcript ID to delete'),
    }),
    handler: async (client: FirefliesClient, args: any) => {
      return await client.deleteTranscript(args.id);
    },
  },

  // ===== Active Meetings =====

  {
    name: 'active_meetings_list',
    description: 'List currently active/live meetings',
    inputSchema: z.object({}),
    handler: async (client: FirefliesClient) => {
      return await client.listActiveMeetings();
    },
  },

  // ===== Analytics =====

  {
    name: 'analytics_get',
    description: 'Get meeting analytics for a time period',
    inputSchema: z.object({
      start_time: z.string().optional().describe('Start time (ISO 8601)'),
      end_time: z.string().optional().describe('End time (ISO 8601)'),
    }),
    handler: async (client: FirefliesClient, args: any) => {
      return await client.getAnalytics(args.start_time, args.end_time);
    },
  },

  // ===== Channels =====

  {
    name: 'channels_list',
    description: 'List all meeting channels/categories',
    inputSchema: z.object({}),
    handler: async (client: FirefliesClient) => {
      return await client.listChannels();
    },
  },

  {
    name: 'channel_get',
    description: 'Get a specific channel by ID',
    inputSchema: z.object({
      id: z.string().describe('Channel ID'),
    }),
    handler: async (client: FirefliesClient, args: any) => {
      return await client.getChannel(args.id);
    },
  },

  // ===== Contacts =====

  {
    name: 'contacts_list',
    description: 'List all contacts from meeting history',
    inputSchema: z.object({}),
    handler: async (client: FirefliesClient) => {
      return await client.listContacts();
    },
  },

  // ===== Soundbites =====

  {
    name: 'bites_list',
    description: 'List soundbite clips from meetings',
    inputSchema: z.object({
      transcript_id: z.string().optional().describe('Filter by transcript ID'),
      limit: z.number().optional().describe('Max results'),
      skip: z.number().optional().describe('Skip count'),
      mine: z.boolean().optional().describe('Only my soundbites'),
    }),
    handler: async (client: FirefliesClient, args: any) => {
      return await client.listBites({
        transcriptId: args.transcript_id,
        limit: args.limit,
        skip: args.skip,
        mine: args.mine,
      });
    },
  },

  {
    name: 'bite_get',
    description: 'Get a specific soundbite by ID',
    inputSchema: z.object({
      id: z.string().describe('Soundbite ID'),
    }),
    handler: async (client: FirefliesClient, args: any) => {
      return await client.getBite(args.id);
    },
  },

  {
    name: 'bite_create',
    description: 'Create a soundbite clip from a transcript',
    inputSchema: z.object({
      transcript_id: z.string().describe('Transcript ID'),
      start_time: z.number().describe('Start time in seconds'),
      end_time: z.number().describe('End time in seconds'),
      name: z.string().optional().describe('Soundbite name'),
      summary: z.string().optional().describe('Soundbite summary'),
    }),
    handler: async (client: FirefliesClient, args: any) => {
      return await client.createBite(args.transcript_id, args.start_time, args.end_time, args.name, args.summary);
    },
  },

  // ===== AskFred AI =====

  {
    name: 'askfred_threads_list',
    description: 'List AskFred AI conversation threads',
    inputSchema: z.object({
      transcript_id: z.string().optional().describe('Filter by transcript ID'),
    }),
    handler: async (client: FirefliesClient, args: any) => {
      return await client.listAskFredThreads(args.transcript_id);
    },
  },

  {
    name: 'askfred_thread_get',
    description: 'Get a specific AskFred AI thread',
    inputSchema: z.object({
      id: z.string().describe('Thread ID'),
    }),
    handler: async (client: FirefliesClient, args: any) => {
      return await client.getAskFredThread(args.id);
    },
  },

  {
    name: 'askfred_thread_create',
    description: 'Ask AI a question about your meetings',
    inputSchema: z.object({
      question: z.string().describe('Question to ask the AI'),
      transcript_id: z.string().optional().describe('Specific transcript to ask about'),
    }),
    handler: async (client: FirefliesClient, args: any) => {
      return await client.createAskFredThread(args.question, args.transcript_id);
    },
  },

  {
    name: 'askfred_thread_continue',
    description: 'Continue an existing AskFred AI conversation',
    inputSchema: z.object({
      thread_id: z.string().describe('Thread ID to continue'),
      question: z.string().describe('Follow-up question'),
    }),
    handler: async (client: FirefliesClient, args: any) => {
      return await client.continueAskFredThread(args.thread_id, args.question);
    },
  },

  // ===== Live Meeting =====

  {
    name: 'live_action_items_get',
    description: 'Get real-time action items from a live meeting',
    inputSchema: z.object({
      meeting_id: z.string().describe('Active meeting ID'),
    }),
    handler: async (client: FirefliesClient, args: any) => {
      return await client.getLiveActionItems(args.meeting_id);
    },
  },

  {
    name: 'meeting_join',
    description: 'Add Fireflies bot to a live meeting',
    inputSchema: z.object({
      meeting_link: z.string().describe('Meeting URL (Zoom, Meet, Teams)'),
      title: z.string().optional().describe('Custom meeting title'),
      duration: z.number().optional().describe('Expected duration in minutes'),
      language: z.string().optional().describe('Language code (e.g., en, es)'),
    }),
    handler: async (client: FirefliesClient, args: any) => {
      return await client.addToLiveMeeting(args.meeting_link, args.title, args.duration, args.language);
    },
  },

  {
    name: 'meeting_title_update',
    description: 'Rename a meeting transcript',
    inputSchema: z.object({
      transcript_id: z.string().describe('Transcript ID'),
      title: z.string().describe('New title'),
    }),
    handler: async (client: FirefliesClient, args: any) => {
      return await client.updateMeetingTitle(args.transcript_id, args.title);
    },
  },

  {
    name: 'meeting_privacy_update',
    description: 'Change meeting transcript privacy setting',
    inputSchema: z.object({
      transcript_id: z.string().describe('Transcript ID'),
      is_public: z.boolean().describe('true=public, false=private'),
    }),
    handler: async (client: FirefliesClient, args: any) => {
      return await client.updateMeetingPrivacy(args.transcript_id, args.is_public);
    },
  },

  // ===== Audio Upload =====

  {
    name: 'audio_upload',
    description: 'Upload audio file URL for transcription',
    inputSchema: z.object({
      url: z.string().describe('Public URL to audio/video file'),
      title: z.string().optional().describe('Custom title for transcription'),
    }),
    handler: async (client: FirefliesClient, args: any) => {
      return await client.uploadAudio(args.url, args.title);
    },
  },
];

export type Tool = (typeof tools)[number];
