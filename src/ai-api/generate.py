from flask import Flask, request, jsonify, send_file
import replicate
import os
from io import BytesIO
import requests

app = Flask(__name__)

# Initialize Replicate client
replicate_client = replicate.Client(api_token=os.getenv("REPLICATE_API_TOKEN"))

@app.route('/generate', methods=['POST'])
def generate_image():
    data = request.get_json()

    # Define default input parameters
    input_params = {
        "seed": 4294967295,
        "prompt": "",
        "go_fast": False,
        "num_outputs": 1,
        "aspect_ratio": "1:1",
        "output_format": "png",
        "output_quality": 80,
    }

    # Update input parameters with any provided data
    input_params.update(data)
    print(input_params) 

    try:
        # Run the model
        output = replicate_client.run(
            "black-forest-labs/flux-schnell",
            input=input_params
        )

        # Fetch the generated image from the output URL
        image_url = output[0]
        image_response = requests.get(image_url)
        image_response.raise_for_status()

        # Create an in-memory bytes buffer for the image
        image_bytes = BytesIO(image_response.content)

        # Send the image as a response
        return send_file(image_bytes, mimetype='image/png')

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
