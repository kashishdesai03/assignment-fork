const AWS = require("aws-sdk");

// Create an SNS client
const sns = new AWS.SNS();

/**
 * Publishes a message to the specified SNS topic.
 * @param {string} topicArn - The ARN of the SNS topic.
 * @param {string} message - The message to publish.
 * @returns {Promise<void>} A promise that resolves when the message is published successfully.
 */
async function postUrlToSNSTopic(topicArn, message) {
  try {
    const params = {
      TopicArn: topicArn,
      Message: message,
    };

    await sns.publish(params).promise();

    console.log("Message published successfully");
  } catch (error) {
    console.error("Error publishing message to SNS:", error);
    throw error;
  }
}

module.exports = postUrlToSNSTopic;
