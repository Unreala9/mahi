// src/lib/initSportsServices.ts
import { sportsResultService } from "@/services/sportsResultService";

/**
 * Initialize sports betting services
 * Call this once when the app starts (after user is authenticated)
 */
export function initSportsServices() {
  console.log('[App] Initializing sports betting services...');

  // Start the result polling service
  sportsResultService.start();

  console.log('[App] Sports betting services initialized');
}

/**
 * Cleanup sports betting services
 * Call this when the app unmounts or user logs out
 */
export function cleanupSportsServices() {
  console.log('[App] Cleaning up sports betting services...');

  sportsResultService.stop();

  console.log('[App] Sports betting services cleaned up');
}
