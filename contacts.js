import fetchDataHelper from './fetchDataHelper.js';

//why are we not putting the tenplate into its own HTML file and just
//importing it?  because HTML Imports are not a thing -- it was never
//adopted, so it is really a missing piece of the spec at this point.
const template = document.createElement('template');
template.innerHTML = `

<style type="text/css">
    .datatable {
        width:100%;
        border-collapse:collapse;
    }
    .datatable th {
        padding:0.5em;
        background : white;
    }
    .datatable td{
        padding: 0.5em;
        border: #4e95f4 1px solid;
    }
    .datatable tr{
        background : #b8d1f3;
    }
    .datatable tr:nth-child(odd) {
        background : #b8d1f3;
    }
    .datatable tr:nth-child(even) {
        background: #dae5f4;
    }
</style>
<div>
    <span class="title"></span>
    <button name="Refresh" class="refreshbutton">Refresh</button>
    <table class="datatable">
    </table>
</div>`;


//This is the module that defines the behavior of our web component
export default class Contacts extends HTMLElement {

    //in the constuctor we initilize state, add our event listeners, and create the
    //shadow DOM
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.refreshButton = this.shadowRoot.querySelector('.refreshbutton');
        this.refresh = this.refresh.bind(this);
        this.refreshButton.addEventListener('click',this.refresh);
        this.table = this.shadowRoot.querySelector('.datatable');
        this.rowClicked = this.rowClicked.bind(this);
        this.table.addEventListener('click',this.rowClicked);
    }


    get title() {
        return this.getAttribute("title");
    }

    //title is a property, but if we set it then it will update the
    //attribute with the same name.
    set title(newtitle) {
        this.setAttribute('title',newtitle);
    }

    //in connectedCallback we retrieve data end render it
    connectedCallback() {
        this.getData();
    }

    //here we remove our event listeners
    disconnectedCallback() {
        this.refreshButton.removeEventListener('click', this.refresh);
        this.table.removeEventListener('click',this.rowClicked);
    }

    //these are the attributes that the component will react on
    static get observedAttributes() {
        return['title'];
    }

    //this is called when we need to rerender because an attribute changed
    attributeChangedCallback(name,oldval,newval) {
        if (name === 'title') {
            console.log('title changed from ' + oldval + ' to ' + newval);
            this.shadowRoot.querySelector(".title").innerHTML = this.title;
        }
    }

    //this will send an event up the DOM when the table is clicked
    rowClicked(event) {
      console.log("rowClicked",event);
       this.dispatchEvent(
         new CustomEvent('contactrowclicked',
         {detail : event.target.innerHTML,
          bubbles : true,
          composed : true}
        )
       );
    }

    refresh() {
        this.getData();
    }

    async getData() {
        const data = await fetchDataHelper({amountOfRecords : 10});
        this.data = data;
        console.log(data);
        this.renderTable();
    }

    renderTable() {
        var table = `
        <thead>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Website</th>
                <th>Amount</th>
                <th>Phone</th>
            </tr>
        </thead>
        <tbody>`;
        this.data.forEach((item,index) => {
           let row = "<tr>";
           row += "<td>"+item.name+"</td>";
           row += "<td>"+item.email+"</td>";
           row += "<td>"+item.website+"</td>";
           row += "<td>"+item.amount+"</td>";
           row += "<td>"+item.phone+"</td>";
           row += "</tr>";
           table += row;
        });
        table += "</tbody>";
        this.shadowRoot.querySelector('.datatable').innerHTML = table;
    }

}

//This is what binds the custom element (namely <my-contacts/>) to our javascript module
customElements.define('my-contacts', Contacts);
