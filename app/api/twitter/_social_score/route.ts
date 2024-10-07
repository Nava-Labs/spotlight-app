import { NextRequest, NextResponse } from "next/server";

async function calculateSocialScore(
  accessToken: string, 
  userId: string
) {
  // Fetch user data
  const userResponse = await fetch(
    `https://api.twitter.com/2/users/${userId}?user.fields=public_metrics`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const userData = await userResponse.json();
  console.log('USER DATA >>>>>', userData);

  // Fetch recent tweets
  const tweetsResponse = await fetch(
    `https://api.twitter.com/2/users/${userId}/tweets?max_results=100&tweet.fields=public_metrics&exclude=retweets`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const recentTweets = await tweetsResponse.json();
  console.log('RECENT TWEETS >>>>>', recentTweets);

  // Calculate score
  const { followers_count, following_count } = userData.data.public_metrics;
  const followerRatio = followers_count / (following_count || 1);
  
  // Apply logarithmic scaling to follower ratio
  const scaledFollowerRatio = Math.log10(followerRatio + 1);

  let totalEngagements = 0;
  let tweetCount = 0;

  for (const tweet of recentTweets.data) {
    const { retweet_count, reply_count, like_count } = tweet.public_metrics;
    // Apply weights to each metric
    totalEngagements += 
      reply_count * 4 +
      retweet_count * 3 +
      like_count * 2;
    tweetCount++;
  }

  const averageEngagementPerTweet = totalEngagements / (tweetCount || 1);
  const engagementRate = averageEngagementPerTweet / (followers_count || 1);

  console.log('SCALED FOLLOWER RATIO >>>>>', scaledFollowerRatio);
  console.log('ENGAGEMENT RATE >>>>>', {engagementRate, averageEngagementPerTweet, totalEngagements, tweetCount, followers_count});

  // Calculate score (0-100)
  const score = Math.min(
    100,
    Math.round((scaledFollowerRatio * 50 + engagementRate * 50) * 100) / 100
  );

  return score;
}

export async function POST(request: NextRequest) {
  const { userId } = await request.json();
    const accessToken = "UHFHd1lTbjdvUkwyaUlWUFN2Tm1pelhBWE02R0FEQk5xYVlzT1dfQ29UR3BzOjE3MjgyNzA1MzQ5MTU6MTowOmF0OjE"
  try {

      // Calculate social score
      const socialScore = await calculateSocialScore(accessToken,  userId);

        return NextResponse.json({ socialScore }, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "An error occurred" }, { status: 400 });
  }
}