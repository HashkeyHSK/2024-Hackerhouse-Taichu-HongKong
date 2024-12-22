from flask import Flask, request, jsonify, render_template
from data_fetcher import DataFetcher
from flask_cors import CORS

app = Flask(__name__)
data_fetcher = DataFetcher()
CORS(app)

@app.route("/")
def index():
    return render_template("index.html")  # 渲染前端页面

@app.route("/api/address_graph", methods=["GET"])
def get_address_data():
    """
    接收钱包地址，返回对应的交互关系数据
    """
    address = request.args.get("address")
    if not address:
        return jsonify({"error": "Address parameter is required"}), 400

    try:
        # 获取地址交互数据
        data = data_fetcher.fetch_address_graph(address.lower())
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/address_info", methods=["GET"])
def fetch_address_info():
    """
    接收钱包地址，返回对应的交互关系数据
    """
    address = request.args.get("address")
    if not address:
        return jsonify({"error": "Address parameter is required"}), 400

    try:
        # 获取地址交互数据
        data = data_fetcher.fetch_address_info(address.lower())
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/edge_info", methods=["GET"])
def get_edge_info():
    """
    接收钱包地址，返回对应的交互关系数据
    """

    from_address = request.args.get("from_address")
    to_address = request.args.get("to_address")
    if not from_address or not to_address:
        return jsonify({"error": "from_address and to_address parameter is required"}), 400

    try:
        # 获取地址交互数据
        data = data_fetcher.fetch_node_edge_info(from_address, to_address)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)