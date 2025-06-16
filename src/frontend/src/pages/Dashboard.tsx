import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

import { APP_STRINGS } from '../constants/strings';
import styled from 'styled-components';
import PulseLoader from '../components/PulseLoader';
import { ResponsiveLine } from '@nivo/line'
const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: rgba(255, 255, 255, 0.9);
`;
const data = [
  {
    "id": "japan",
    "color": "hsl(241, 70%, 50%)",
    "data": [
      {
        "x": "plane",
        "y": 20
      },
      {
        "x": "helicopter",
        "y": 292
      },
      {
        "x": "boat",
        "y": 151
      },
      {
        "x": "train",
        "y": 273
      },
      {
        "x": "subway",
        "y": 69
      },
      {
        "x": "bus",
        "y": 14
      },
      {
        "x": "car",
        "y": 103
      },
      {
        "x": "moto",
        "y": 175
      },
      {
        "x": "bicycle",
        "y": 150
      },
      {
        "x": "horse",
        "y": 149
      },
      {
        "x": "skateboard",
        "y": 1
      },
      {
        "x": "others",
        "y": 93
      }
    ]
  },
  {
    "id": "france",
    "color": "hsl(72, 70%, 50%)",
    "data": [
      {
        "x": "plane",
        "y": 50
      },
      {
        "x": "helicopter",
        "y": 112
      },
      {
        "x": "boat",
        "y": 11
      },
      {
        "x": "train",
        "y": 39
      },
      {
        "x": "subway",
        "y": 13
      },
      {
        "x": "bus",
        "y": 39
      },
      {
        "x": "car",
        "y": 170
      },
      {
        "x": "moto",
        "y": 215
      },
      {
        "x": "bicycle",
        "y": 205
      },
      {
        "x": "horse",
        "y": 6
      },
      {
        "x": "skateboard",
        "y": 25
      },
      {
        "x": "others",
        "y": 292
      }
    ]
  },
  {
    "id": "us",
    "color": "hsl(49, 70%, 50%)",
    "data": [
      {
        "x": "plane",
        "y": 86
      },
      {
        "x": "helicopter",
        "y": 251
      },
      {
        "x": "boat",
        "y": 212
      },
      {
        "x": "train",
        "y": 248
      },
      {
        "x": "subway",
        "y": 173
      },
      {
        "x": "bus",
        "y": 205
      },
      {
        "x": "car",
        "y": 223
      },
      {
        "x": "moto",
        "y": 291
      },
      {
        "x": "bicycle",
        "y": 232
      },
      {
        "x": "horse",
        "y": 20
      },
      {
        "x": "skateboard",
        "y": 122
      },
      {
        "x": "others",
        "y": 226
      }
    ]
  },
  {
    "id": "germany",
    "color": "hsl(283, 70%, 50%)",
    "data": [
      {
        "x": "plane",
        "y": 29
      },
      {
        "x": "helicopter",
        "y": 260
      },
      {
        "x": "boat",
        "y": 8
      },
      {
        "x": "train",
        "y": 41
      },
      {
        "x": "subway",
        "y": 266
      },
      {
        "x": "bus",
        "y": 25
      },
      {
        "x": "car",
        "y": 149
      },
      {
        "x": "moto",
        "y": 195
      },
      {
        "x": "bicycle",
        "y": 8
      },
      {
        "x": "horse",
        "y": 241
      },
      {
        "x": "skateboard",
        "y": 244
      },
      {
        "x": "others",
        "y": 238
      }
    ]
  },
  {
    "id": "norway",
    "color": "hsl(300, 70%, 50%)",
    "data": [
      {
        "x": "plane",
        "y": 204
      },
      {
        "x": "helicopter",
        "y": 139
      },
      {
        "x": "boat",
        "y": 116
      },
      {
        "x": "train",
        "y": 115
      },
      {
        "x": "subway",
        "y": 116
      },
      {
        "x": "bus",
        "y": 285
      },
      {
        "x": "car",
        "y": 249
      },
      {
        "x": "moto",
        "y": 43
      },
      {
        "x": "bicycle",
        "y": 162
      },
      {
        "x": "horse",
        "y": 118
      },
      {
        "x": "skateboard",
        "y": 194
      },
      {
        "x": "others",
        "y": 28
      }
    ]
  }
]
const Dashboard = ({ data /* see data tab */ }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadDashboardData = async () => {
      try {
        // Add your actual data fetching logic here
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <LoaderContainer>
        <PulseLoader  />
      </LoaderContainer>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1>{APP_STRINGS.DASHBOARD_TITLE}fsd</h1>
          {/* Add your dashboard content here */}
        

    <ResponsiveLine
        data={data}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: true,
            reverse: false
        }}
        yFormat=" >-.2f"
        axisTop={null}
        axisRight={null}
        axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'transportation',
            legendOffset: 36,
            legendPosition: 'middle',
            truncateTickAt: 0
        }}
        axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'count',
            legendOffset: -40,
            legendPosition: 'middle',
            truncateTickAt: 0
        }}
        pointSize={10}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabel="data.yFormatted"
        pointLabelYOffset={-12}
        enableTouchCrosshair={true}
        useMesh={true}
        legends={[
            {
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemBackground: 'rgba(0, 0, 0, .03)',
                            itemOpacity: 1
                        }
                    }
                ]
            }
        ]}
    />



        </div>
      </main>
    </div>
  );
};

export default Dashboard;
