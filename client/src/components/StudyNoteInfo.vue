<template functional>
    <div>
        <h1> {{ props.name }}</h1>
        <span> Last revieved:  <h2> {{ props.lastReviewed | fromNow }}</h2> </span>
    </div>
</template>