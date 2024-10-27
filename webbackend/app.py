from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os

app = Flask(__name__)
CORS(app)

# MongoDB connection setup
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client['DDinteraction']
interaction_collection = db['interaction_check']
drug_collection = db['Drugs']

# Route to check if a drug is pregnancy safe
@app.route('/check_pregnancy_safe', methods=['GET'])
def check_pregnancy_safe():
    drug_name = request.args.get('drug_name')
    if not drug_name:
        return jsonify({"error": "Please provide a drug_name parameter"}), 400

    # Find the drug in the database
    drug = drug_collection.find_one({"drug_name": drug_name})
    if not drug:
        return jsonify({"error": "Drug not found"}), 404

    # Check the pregnancy category
    pregnancy_category = drug.get("pregnancy_category", "")
    if pregnancy_category in ["A", "B"]:
        message = f"{drug_name} is generally considered safe for pregnancy (Category {pregnancy_category})."
    elif pregnancy_category in ["C", "D", "X"]:
        message = f"{drug_name} is not recommended for pregnancy (Category {pregnancy_category})."
    else:
        message = f"Pregnancy safety information for {drug_name} is unavailable."

    return jsonify({"drug_name": drug_name, "pregnancy_category": pregnancy_category, "message": message})

# Route to check interactions between drugs
@app.route('/check-interactions', methods=['POST'])
def check_interactions():
    data = request.json
    drug_list = data.get('drugs', [])

    if len(drug_list) < 2:
        return jsonify({"message": "Please enter at least two drugs to check for interactions."}), 400

    interactions_found = []
    try:
        for i in range(len(drug_list)):
            for j in range(i + 1, len(drug_list)):
                drug1 = drug_list[i].strip()
                drug2 = drug_list[j].strip()

                # Find the interaction from the MongoDB collection
                interaction = interaction_collection.find_one({
                    "$or": [
                        {"Drug 1": drug1, "Drug 2": drug2},
                        {"Drug 1": drug2, "Drug 2": drug1}
                    ]
                })

                # Add to interactions if found
                if interaction:
                    interactions_found.append({
                        "Drug 1": interaction["Drug 1"],
                        "Drug 2": interaction["Drug 2"],
                        "Interaction Description": interaction["Interaction Description"]
                    })

        # Return a message if no interactions are found
        if not interactions_found:
            return jsonify({"message": "No interactions found between the selected drugs."})
        return jsonify(interactions_found)
    
    except Exception as e:
        print("Error checking interactions:", e)
        return jsonify({"message": "Error checking interactions. Please try again later."}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
