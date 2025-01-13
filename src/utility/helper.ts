import { MD5 } from "crypto-js";

export function convertToDate(dateString:string) {
    // Extract components
    const year = dateString.slice(0, 4);
    const month = dateString.slice(4, 6);
    const day = dateString.slice(6, 8);
    const hour = dateString.slice(9, 11);
    const minute = dateString.slice(11, 13);
    const second = dateString.slice(13, 15);
  
    // Create date string in ISO format
    const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
    
    // Return new Date object
    return new Date(isoString);
  }

export function encodePassword(password:string) {
    return MD5(password).toString();
}