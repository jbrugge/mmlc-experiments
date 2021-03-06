/**
* Equation.js
*
* @description :: An equation with input type, equation in source format,
* 				   and generated components.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	mathType: {
    	type: 'string',
    	required: true,
    	enum: ['AsciiMath', 'MathML', 'TeX']
    },
    math: {
    	type: 'string',
    	required: true
    },
	equationName: 'string',
    qualityScore: 'integer',
	submittedBy: {
		model: 'user'
    },
    components: {
    	collection: 'component',
    	via: 'equation'
    },
    feedback: {
    	collection: 'feedback',
    	via: 'equation'
    },
    html5: {
        model: 'html5'
    },
    ip_address: {
        type: 'string'
    }
  }
};

