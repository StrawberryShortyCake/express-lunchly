> Add a quick search form to nav bar (base.jinja) - done
>> update the action in the form to go customer[id]

----------------

> update post / route
>> get a string from submission
>> call class method
>>>> query customer instance based on name
>>>> return a array of customer instances if available
>>>> error if array.length === 0
>> get customer instances array
>> pass in customer instances array to customer_list.jinja as template render
