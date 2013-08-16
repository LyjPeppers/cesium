/*global define*/
define(['../Core/DeveloperError'], function(DeveloperError) {
    "use strict";

    function throwInstantiationError() {
        throw new DeveloperError('This type should not be instantiated directly.');
    }

    var InterpolatableValue = {};

    InterpolatableValue.packedLength = undefined;

    InterpolatableValue.packedInterpolationLength = undefined;

    InterpolatableValue.pack = throwInstantiationError;

    InterpolatableValue.unpack = throwInstantiationError;

    InterpolatableValue.packForInterpolation = throwInstantiationError;

    InterpolatableValue.unpackInterpolationResult = throwInstantiationError;

    return InterpolatableValue;
});
