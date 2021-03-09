/*//////////////////////////////////////////////////
//  © 2021, created by Brendan Scott  //  v. 1.0  //
//////////////////////////////////////////////////////////////
//  Include this file with <script src="NNet.js"></script>  // 
////////////////////////////////////////////////////////////*/

// Sigmoid

function sigmoid(x) {return 1 / (1 + Math.exp(-x));}
function dsigmoid(y) {return y * (1 - y);}

// Simple matrix math class

class Matrix {
	constructor(Rows, Cols) {
		this.rows = Rows;
		this.cols = Cols;
		this.data = [];
		
		for (let i = 0; i < this.rows; i++) {
			this.data[i] = [];
			for (let j = 0; j < this.cols; j++) {
				this.data[i][j] = 0;
	}}}
	static fromArray(arr){
		let m = new Matrix(arr.length, 1);
		for (let i = 0; i < arr.length; i++){
			m.data[i][0] = arr[i];
		}
		return m;
	}
	toArray() {
		let arr = [];
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
			arr.push(this.data[i][j]);
		}}
		return arr;
	}
	randomize() {
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				this.data[i][j] = Math.random() * 2 - 1;
	}}}
	add(num) {
		if (num instanceof Matrix) {
			for (let i = 0; i < this.rows; i++) {
				for (let j = 0; j < this.cols; j++) {
					this.data[i][j] += num.data[i][j];
		}}} else {
			for (let i = 0; i < this.rows; i++) {
				for (let j = 0; j < this.cols; j++) {
					this.data[i][j] += num;
	}}}}
	static subtract(a, b) {
		let result = new Matrix(a.rows, a.cols);
		for (let i = 0; i < result.rows; i++) {
			for (let j = 0; j < result.cols; j++) {
			result.data[i][j] = a.data[i][j] - b.data[i][j];
		}}
		return result;
	}	
	static multiply(a, b) {
		if(a.cols !== b.rows){
			console.log("Cols of A must match rows of B")
			return undefined;
		}
			let result = new Matrix(a.rows, b.cols);
			for (let i = 0; i < result.rows; i++) {
				for (let j = 0; j < result.cols; j++) {
					let sum = 0
					for (let k = 0; k < a.cols; k++) {
						sum += a.data[i][k] * b.data[k][j];
					}
					result.data[i][j] = sum; 
			}}
			return result;
		}
	multiply(num) {
		if (num instanceof Matrix) {
			for (let i = 0; i < this.rows; i++) {
				for (let j = 0; j < this.cols; j++) {
					this.data[i][j] *= num.data[i][j];
		}}} else {
			for (let i = 0; i < this.rows; i++) {
				for (let j = 0; j < this.cols; j++) {
					this.data[i][j] *= num;
	}}}}
	static transpose(matrix) {
		let result = new Matrix(matrix.cols, matrix.rows);
		for (let i = 0; i < matrix.rows; i++) {
			for (let j = 0; j < matrix.cols; j++) {
				result.data[j][i] = matrix.data[i][j];
		}}
		return result;
	}
	map(funct) {
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				let val = this.data[i][j];
				this.data[i][j] = funct(val);
	}}}
	static map(matrix, func) {
		let result = new Matrix(matrix.rows, matrix.cols);
		for (let i = 0; i < matrix.rows; i++) {
			for (let j = 0; j < matrix.cols; j++) {
				let val = matrix.data[i][j];
				result.data[i][j] = func(val);
		}}
		return result;
	}
	print() {console.table(this.data);}
}

// Simple neuron class

class Neuron {
	constructor(WeightL, LearnR) {
		this.weights = new Array(WeightL);
		for (let i = 0; i < this.weights.length; i++) {
			this.weights[i] = Math.random(-1, 1);
		}
		this.c = LearnR;
	}
	train(inputs, desired) {
		let guess = this.guess(inputs);
		let error = desired - guess;
		for (let i = 0; i < this.weights.length; i++) {
			this.weights[i] += this.c * error * inputs[i];
	}}
	guess(inputs) {
		let sum = 0;
		for (let i = 0; i < this.weights.length; i++) {
			sum += inputs[i] * this.weights[i];
		}
		return this.activate(sum);
	}
	activate(sum) {
		if (sum >= 0) return 1;
		else return -1;
	}
	getWeights() {
		return this.weights;
}}

// Neural network class

class NeuralNetwork {
	constructor(inputN, hiddenN, outputN) {
		this.input_nodes = inputN;
		this.hidden_nodes = hiddenN;
		this.output_nodes = outputN;
		this.weights_ih = new Matrix(this.hidden_nodes, this.input_nodes);
		this.weights_ho = new Matrix(this.output_nodes, this.hidden_nodes);
		this.weights_ih.randomize();
		this.weights_ho.randomize();
		this.bias_h = new Matrix(this.hidden_nodes, 1);
		this.bias_o = new Matrix(this.output_nodes, 1);
		this.bias_h.randomize();
		this.bias_o.randomize();
		this.learning_rate = 0.1;
	}
	guess(input_array) {
		let input = Matrix.fromArray(input_array);
		let hiddenV = Matrix.multiply(this.weights_ih, input);
		hiddenV.add(this.bias_h);
		hiddenV.map(sigmoid);
		let output = Matrix.multiply(this.weights_ho, hiddenV);
		output.add(this.bias_o);
		output.map(sigmoid);
		return output.toArray();
	}
	train(input_array, target_array) {
		let inputs = Matrix.fromArray(input_array);
		let hiddenV = Matrix.multiply(this.weights_ih, inputs);
		hiddenV.add(this.bias_h);
		hiddenV.map(sigmoid);
		let outputs = Matrix.multiply(this.weights_ho, hiddenV);
		outputs.add(this.bias_o);
		outputs.map(sigmoid);
		let targets = Matrix.fromArray(target_array);
		let output_errors = Matrix.subtract(targets, outputs);
		let gradients = Matrix.map(outputs, dsigmoid);
		gradients.multiply(output_errors);
		gradients.multiply(this.learning_rate);
		let hidden_T = Matrix.transpose(hiddenV);
		let weight_ho_deltas = Matrix.multiply(gradients, hidden_T)
		this.weights_ho.add(weight_ho_deltas);
		this.bias_o.add(gradients);
		let who_t = Matrix.transpose(this.weights_ho);
		let hidden_errors = Matrix.multiply(who_t, output_errors);
		let hidden_gradient = Matrix.map(hiddenV, dsigmoid);
		hidden_gradient.multiply(hidden_errors);
		hidden_gradient.multiply(this.learning_rate);
		let inputs_T = Matrix.transpose(inputs);
		let weight_ih_deltas = Matrix.multiply(hidden_gradient, inputs_T)
		this.weights_ih.add(weight_ih_deltas);
		this.bias_h.add(hidden_gradient);
	}
}
