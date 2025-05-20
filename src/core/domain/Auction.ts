/**
 * Auction Domain Entity
 * Represents an auction in the naval auction platform
 */

export enum AuctionStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  AWARDED = 'awarded',
  CANCELLED = 'cancelled',
}

export interface AuctionDocument {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  url: string;
}

export interface AuctionRequirement {
  id: string;
  description: string;
  isRequired: boolean;
  category: string;
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  status: AuctionStatus;
  publicationDate: Date;
  closingDate: Date;
  estimatedValue: {
    amount: number;
    currency: string;
  };
  location: string;
  buyerName: string;
  buyerType: string;
  cpvCodes: string[];
  documents: AuctionDocument[];
  requirements: AuctionRequirement[];
  relevanceScore?: number;
  url: string;
}

export class AuctionEntity implements Auction {
  id: string;
  title: string;
  description: string;
  status: AuctionStatus;
  publicationDate: Date;
  closingDate: Date;
  estimatedValue: {
    amount: number;
    currency: string;
  };
  location: string;
  buyerName: string;
  buyerType: string;
  cpvCodes: string[];
  documents: AuctionDocument[];
  requirements: AuctionRequirement[];
  relevanceScore?: number;
  url: string;

  constructor(auction: Auction) {
    this.id = auction.id;
    this.title = auction.title;
    this.description = auction.description;
    this.status = auction.status;
    this.publicationDate = new Date(auction.publicationDate);
    this.closingDate = new Date(auction.closingDate);
    this.estimatedValue = { ...auction.estimatedValue };
    this.location = auction.location;
    this.buyerName = auction.buyerName;
    this.buyerType = auction.buyerType;
    this.cpvCodes = [...auction.cpvCodes];
    this.documents = auction.documents.map(doc => ({
      ...doc,
      uploadDate: new Date(doc.uploadDate),
    }));
    this.requirements = auction.requirements.map(req => ({ ...req }));
    this.relevanceScore = auction.relevanceScore;
    this.url = auction.url;
  }

  /**
   * Check if the auction is still open for submissions
   * @returns True if the auction is open
   */
  public isOpen(): boolean {
    return this.status === AuctionStatus.OPEN && new Date() < this.closingDate;
  }

  /**
   * Calculate days remaining until the auction closes
   * @returns Number of days remaining
   */
  public daysRemaining(): number {
    if (this.status !== AuctionStatus.OPEN) {
      return 0;
    }

    const now = new Date();
    const diffTime = this.closingDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Update the auction's relevance score
   * @param score The relevance score
   */
  public updateRelevanceScore(score: number): void {
    this.relevanceScore = score;
  }
}
