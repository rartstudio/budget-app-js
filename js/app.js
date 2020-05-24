//budget controller
let budgetController = (function(){
    
    //expense function constructor
    let Expense = function (id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    //prototype of calculation percentage
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else{
            this.percentage = -1;
        }
    }

    //prototype get percentage
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    //income function constructor
    let Income = function (id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    //calculate the total
    let calculateTotal = function(type){
        let sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    
    //our data structure
    let data = {
        allItems : {
            exp : [],
            inc : []
        },
        totals : {
            exp : 0,
            inc : 0
        },
        budget : 0,
        percentage : -1
    };

    return {
        addItem : function(type, des, val){
            let newItem , ID;

            //normal version
            //[1 2 3 4 5 ] next ID is 6
            
            //delete version
            //[1 2 4 6 8 ] next ID is 9
            
            // iD = Last ID +1

            //create new iD
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            }
            else {
                ID = 0;
            }

            //create new item based on inc or exp type
            if (type === 'exp'){
                newItem = new Expense(ID,des,val);
            }
            else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }

            //push it into our data structure
            data.allItems[type].push(newItem);

            //return the new element
            return newItem;
        },
        deleteItem : function(type,id){
            let ids, index;

            // ids = [1,2,4,8]
            //index = 3

            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
        },
        calculateBudget : function (){

            //calculate total income and expenese
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget : income -expense
            data.budget = data.totals.inc - data.totals.exp

            //calculate the percentage of income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else {
                data.percentage = -1;
            }
        },
        calculatePercentages : function(){
            /*
            a=20. b=10, c=40
            income = 100 
            a = 20/100 = 0.2
            b = 10/100 = 0.1
            c = 40/100 = 0.4
            */
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentages : function(){
            let allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },
        getBudget : function(){
            return {
                budget : data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage
            }
        },
        testing : function (){
            console.log(data);
        }
    }
})();


//ui controller
let UIController = (function(){

    // containing element we use
    let DOMstrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeContainer : '.income__list',
        expensesContainer : '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expensesLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        expensePercLabel :'.item__percentage',
        dateLabel : '.budget__title--month'
    };

    let formatNumber = function(num, type){
        let numSplit, int, dec;

        /*
        + or - before number
        exactly 2 decimal points
        comma separating the thousand

        ex 
        2310.4567  -> + 2.310,46
        2000 -> 2.000,00
        */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];

        if(int.length > 3){
            //input 34510 , output 34.510
            int = int.substr(0,int.length-3) + '.'+ int.substr(int.length-3, 3);
        }

        dec = numSplit[1];
        
        return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int +',' +dec;
    };

    let nodeListForEach = function(list,callback){
        for (let i = 0; i < list.length; i++){
            callback(list[i],i);
        }
    };

    return {
        getInput : function(){
            return {
                type : document.querySelector(DOMstrings.inputType).value,
                description : document.querySelector(DOMstrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItem : function(obj, type){
            let html, newHTML, element;

            //create HTML string with placeholader text

            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if (type==='exp'){
                element = DOMstrings.expensesContainer;
                html ='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //replace the placeholder text with some actual data
            newHTML = html.replace('%id%',obj.id);
            newHTML = newHTML.replace('%description%',obj.description);
            newHTML = newHTML.replace('%value%',formatNumber(obj.value,type));

            // insert the html into container
            document.querySelector(element).insertAdjacentHTML('beforeend',newHTML);
        },

        deleteListItem: function(selectorID){
            let el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields : function(){
            let fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array){
                current.value = '';
            });

            fieldsArr[0].focus();
        },

        displayBudget : function(obj){
            let type;

            obj.budget > 0 ? type='inc' : type='exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');

            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages : function(percentages){

            let fields = document.querySelectorAll(DOMstrings.expensePercLabel);

            nodeListForEach(fields,function(current,index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }
                else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth : function(){
            let now, year, month ;

            //create new object date
            now = new Date();

            months = [ 'January', 'February', 'March', 'April', 'May','June', 'July', 'August', 'September', 'October', 'November','December'];
            month = now.getMonth();

            //get full year of date
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] +' '+year;


        },

        changedType : function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            nodeListForEach(fields,function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstring : function(){
            return DOMstrings;
        }
    }
})();


//global app controller
let controller = (function (budgetCtrl, UIctrl){

    let setupEventListener = function (){
        let DOM = UIctrl.getDOMstring();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress',function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change',UIctrl.changedType);
    };

    let updateBudget = function(){

        // calculate the budget
        budgetCtrl.calculateBudget();

        // return the budget
        let budget = budgetCtrl.getBudget();

        // display the budget on the ui 
        UIctrl.displayBudget(budget);
    };

    let updatePercentages = function(){
        //calculate percentages
        budgetController.calculatePercentages();

        //read the percentages from the budget controller
        let percentages = budgetController.getPercentages();

        //update the UI
        UIctrl.displayPercentages(percentages);
    }

    let ctrlAddItem = function(){
        let input,newItem; 

        // get the field input data
        input = UIctrl.getInput();

        //check input by user
        //if not empty run that
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            // add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // add the item to the ui 
            UIctrl.addListItem(newItem,input.type);

            //clear the fields
            UIctrl.clearFields();

            //calculate and update budget
            updateBudget();

            //calculate and update percentages
            updatePercentages();
        }
    }

    let ctrlDeleteItem = function (event){
        let itemID, splitID, type, ID;

        //get parent element on button to  list income
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){
            
            //format id : inc-1
            //using split function to split a text to some text in array format
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. delete the item from our data structure
            budgetCtrl.deleteItem(type,ID);
            
            //2. delete the item from UI
            UIctrl.deleteListItem(itemID);

            //3. update and show the new budget
            updateBudget();

            //4. update and show the new percentages of budget
        }

        console.log();
    }

    return {
        init : function(){
            console.log('application has started');
            setupEventListener();
            UIctrl.displayMonth();
            UIctrl.displayBudget({
                budget : 0,
                totalInc : 0,
                totalExp : 0,
                percentage : -1
            });
        }
    }
})(budgetController, UIController);

//running init function
controller.init();