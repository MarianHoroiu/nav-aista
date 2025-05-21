import React from 'react';

import { Button } from './atoms/Button';
import { Input } from './atoms/Input';
import { Label } from './atoms/Label';
import { Card } from './molecules/Card';
import { FormGroup } from './molecules/FormGroup';
import { ResultsTable } from './organisms/ResultsTable';

// Demo component to test our UI components
export const UIDemo: React.FC = () => {
  // Sample auction data
  const sampleData = [
    {
      id: '1',
      title: 'Naval Equipment Auction',
      date: '2023-06-15',
      price: '€50,000',
      status: 'active',
      documentCount: 3,
      url: 'https://e-licitatie.ro/auction/123',
    },
    {
      id: '2',
      title: 'Ship Parts and Accessories',
      date: '2023-05-20',
      price: '€25,000',
      status: 'expired',
      documentCount: 5,
      url: 'https://e-licitatie.ro/auction/456',
    },
  ];

  return (
    <div className="p-4">
      <h1>Naval Auction Assistant UI Demo</h1>

      <section className="mb-8">
        <h2>Atoms</h2>

        <div className="flex space-x-2 mb-4">
          <Button>Default Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="success">Success</Button>
        </div>

        <div className="mb-4">
          <Label htmlFor="demo-input">Demo Input</Label>
          <Input id="demo-input" placeholder="Enter text here..." />
        </div>
      </section>

      <section className="mb-8">
        <h2>Molecules</h2>

        <FormGroup
          id="name"
          label="Full Name"
          inputProps={{ placeholder: 'Enter your name' }}
          required
        />

        <Card title="Demo Card" className="mt-4">
          <p>This is a sample card component with some content.</p>
        </Card>
      </section>

      <section>
        <h2>Organisms</h2>

        <ResultsTable
          data={sampleData}
          onViewDetails={auction => console.log('View details', auction)}
          onAnalyze={auction => console.log('Analyze', auction)}
        />
      </section>
    </div>
  );
};

export default UIDemo;
