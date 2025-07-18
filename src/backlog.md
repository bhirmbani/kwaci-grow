in Production Management (/production) route. adjust:
- Add calendar view in Overview tab so user can see how much ingredient consumed for each day
- add analytics tracking how much of each ingredient is used per day, per week, per month
- make information is the trend is declining or increasing each day for each ingredient consumed


in /warehouse (Stock Levels tab) add:
- calendar view, how much ingredient consumed per day per ingredient item
- as a user, i want to know, with current ingredient stock, how much product we can make before we run out of stock (do this for every product we had)

in /production, we need to show user the actual amount of product we have after succesful production batch creation. currently, we only show the amount of ingredients used, but not the actual product output. After that, we need to make sure in /operations route, when user "Record new sale", we must validate the product based on the amount of product in production batch. if for example production batch #1 only create 10 espresso, and user record sale of 11 espresso, it will show meaningful error message such as we only have x amount of product available to sell, create new product first, etc. (user cannot do this).

in /operations, projections tab, when use actual sales data and use targets only, there is not too much difference in tha table other than performance column, the other column value still same

we need to add validation: we should not be able to add product to menu if that product doesnt have ingredient

in /operations, target analysis tab, there are expected percentage value, check if this is calculated correctly and what does it means. do we still need this value to be showed to the user?

create new feature: /accounting route:
- a complete yet simple accounting functionality with best practise in accounting world

there is no form to change status of plans. i see there are active and draft status. but there are no form to change the status. this location in plan route, planning dashboard tab

ingredient that is not fixed. for example plastic bag. we will buy plastic bag as an inventory item but not all product we make will use plastic bag. how to handle this? just record the date of plastic bag is empty/run out then we will spread those plastic bag cost to the products being sold during that period (from the date we buy the plastic bag to the date we run out of it).

in reports - financial overview user need to know profit and cost for each branch, menu, and product.

- invoice module with payment

- send WA to customer

- handle intangible ingredient to the COGS calculator and related. for example cost of transportation delivery cost, etc. how to implement this in our app? how the calculation to be able to come to conclusion that the cost is X amount per product item?

- smart production recommendation:
    - based on product sales trend, create auto spread sales-targets for every product in the manu
    - based on product sales trend, create recommendation of ingredient stock and when we should buy more of that ingredient

- implement bonus feature:
    - per employee if reach sales target amount

- in dashboard / root route:
    - add quick actions for user to record income and outcome for the day